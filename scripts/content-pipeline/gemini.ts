/**
 * WildArc Content Pipeline — Gemini API Wrapper
 *
 * Handles all communication with Google's Gemini API for image generation.
 * Supports: text-to-image, reference-image-guided generation, multi-slide batching.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PipelineConfig, GeneratedImage, ImageDimension, QualityCheck } from './types';

// ─── Gemini API Types ────────────────────────────────────────

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;  // base64
  };
}

interface GeminiContent {
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// ─── Gemini Client ───────────────────────────────────────────

export class GeminiClient {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: PipelineConfig) {
    this.apiKey = config.geminiApiKey;
    this.model = config.geminiModel;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  /**
   * Generate a single image from a text prompt + optional reference images.
   */
  async generateImage(opts: {
    prompt: string;
    referenceImages?: string[];   // file paths to reference images
    outputPath: string;
    dimensions: ImageDimension;
  }): Promise<{ image: GeneratedImage; promptTokens: number }> {
    const parts: GeminiPart[] = [];

    // Add reference images first (if any)
    if (opts.referenceImages?.length) {
      for (const refPath of opts.referenceImages) {
        const imageData = this.loadImageAsBase64(refPath);
        if (imageData) {
          parts.push({
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.data,
            },
          });
        }
      }
    }

    // Add the text prompt
    parts.push({ text: opts.prompt });

    // Call Gemini API
    const response = await this.callGemini(parts);

    // Extract image from response
    const imageResult = this.extractImage(response);
    if (!imageResult) {
      throw new Error('Gemini did not return an image. Response may contain only text.');
    }

    // Save to disk
    const outputDir = path.dirname(opts.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const imageBuffer = Buffer.from(imageResult.data, 'base64');
    fs.writeFileSync(opts.outputPath, imageBuffer);

    const stats = fs.statSync(opts.outputPath);

    return {
      image: {
        path: opts.outputPath,
        mimeType: imageResult.mimeType,
        sizeBytes: stats.size,
        dimensions: opts.dimensions,
      },
      promptTokens: response.usageMetadata?.totalTokenCount || 0,
    };
  }

  /**
   * Generate multiple images (carousel slides) in sequence.
   */
  async generateCarousel(opts: {
    slidePrompts: string[];
    referenceImages?: string[];
    outputDir: string;
    dimensions: ImageDimension;
    filenamePrefix: string;
  }): Promise<{ images: GeneratedImage[]; totalTokens: number }> {
    const images: GeneratedImage[] = [];
    let totalTokens = 0;

    for (let i = 0; i < opts.slidePrompts.length; i++) {
      const slideNum = String(i + 1).padStart(2, '0');
      const outputPath = path.join(opts.outputDir, `${opts.filenamePrefix}_slide_${slideNum}.png`);

      console.log(`  Generating slide ${i + 1}/${opts.slidePrompts.length}...`);

      try {
        const result = await this.generateImage({
          prompt: opts.slidePrompts[i],
          referenceImages: opts.referenceImages,
          outputPath,
          dimensions: opts.dimensions,
        });

        result.image.slideIndex = i;
        images.push(result.image);
        totalTokens += result.promptTokens;

        // Small delay between API calls to respect rate limits
        if (i < opts.slidePrompts.length - 1) {
          await this.sleep(2000);
        }
      } catch (err) {
        console.error(`  ⚠️ Slide ${i + 1} failed: ${(err as Error).message}`);
        // Continue with remaining slides
      }
    }

    return { images, totalTokens };
  }

  // ─── Private Methods ─────────────────────────────────────

  private async callGemini(parts: GeminiPart[]): Promise<GeminiResponse> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<GeminiResponse>;
  }

  private extractImage(response: GeminiResponse): { mimeType: string; data: string } | null {
    if (!response.candidates?.length) return null;

    for (const candidate of response.candidates) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return {
            mimeType: part.inlineData.mimeType,
            data: part.inlineData.data,
          };
        }
      }
    }

    return null;
  }

  /**
   * Also extract any text from the response (for captions, descriptions).
   */
  extractText(response: GeminiResponse): string {
    if (!response.candidates?.length) return '';

    const textParts: string[] = [];
    for (const candidate of response.candidates) {
      for (const part of candidate.content.parts) {
        if (part.text) {
          textParts.push(part.text);
        }
      }
    }

    return textParts.join('\n');
  }

  private loadImageAsBase64(filePath: string): { mimeType: string; data: string } | null {
    try {
      const absPath = path.resolve(filePath);
      if (!fs.existsSync(absPath)) {
        console.warn(`  Reference image not found: ${absPath}`);
        return null;
      }

      const ext = path.extname(absPath).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
      };

      const mimeType = mimeMap[ext] || 'image/png';
      const data = fs.readFileSync(absPath).toString('base64');

      return { mimeType, data };
    } catch {
      console.warn(`  Could not load reference image: ${filePath}`);
      return null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ─── Quality Checks ──────────────────────────────────────────

export function runQualityChecks(images: GeneratedImage[]): QualityCheck[] {
  const checks: QualityCheck[] = [];

  // Check: images were generated
  checks.push({
    name: 'images_generated',
    passed: images.length > 0,
    details: `${images.length} image(s) generated`,
  });

  for (const img of images) {
    // Check: file exists and has content
    const exists = fs.existsSync(img.path);
    const size = exists ? fs.statSync(img.path).size : 0;

    checks.push({
      name: `file_exists_${img.slideIndex ?? 0}`,
      passed: exists && size > 10000,  // At least 10KB (not blank/corrupt)
      details: exists ? `${(size / 1024).toFixed(1)}KB` : 'File missing',
    });

    // Check: reasonable file size (not too small = blank, not too large = corrupt)
    checks.push({
      name: `file_size_${img.slideIndex ?? 0}`,
      passed: size > 50000 && size < 20_000_000,  // 50KB - 20MB
      details: `${(size / 1024).toFixed(1)}KB (expected 50KB-20MB)`,
    });
  }

  return checks;
}
