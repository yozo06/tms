/**
 * 🌸 WildArc Bloom — HuggingFace FLUX Client
 *
 * Free fallback image generator using HuggingFace Inference API.
 * Uses FLUX.1-schnell — fast, high-quality, free with a HF token.
 *
 * Setup (one-time, ~2 minutes):
 *   1. Sign up free at https://huggingface.co
 *   2. Go to Settings → Access Tokens → New token (type: Read)
 *   3. Add to .env:  HF_TOKEN=hf_xxxxxxxxxxxxxxxx
 *
 * Free tier limits: ~1000 requests/day — more than enough for 1 image/day.
 */

import * as fs from 'fs';
import * as path from 'path';
import { GeneratedImage, ImageDimension } from './types';

// ─── HuggingFace Config ──────────────────────────────────────

const HF_MODEL = 'black-forest-labs/FLUX.1-schnell';
const HF_BASE_URL = 'https://api-inference.huggingface.co/models';

// FLUX.1-schnell optimal dimensions (must be multiples of 64)
// Instagram portrait 4:5 → 1024×1280 (closest to 1080×1350)
const FLUX_DIMENSIONS = {
  width: 1024,
  height: 1280,
};

// ─── HuggingFace Client ─────────────────────────────────────

export class HuggingFaceClient {
  private token: string;
  private model: string;

  constructor(token: string, model = HF_MODEL) {
    this.token = token;
    this.model = model;
  }

  /**
   * Generate a single image using HuggingFace Inference API (FLUX.1-schnell).
   * Returns a GeneratedImage compatible with the rest of the Bloom pipeline.
   */
  async generateImage(opts: {
    prompt: string;
    outputPath: string;
    dimensions: ImageDimension;
  }): Promise<GeneratedImage> {
    const url = `${HF_BASE_URL}/${this.model}`;

    // FLUX responds best to prompts without complex JSON structures
    const cleanPrompt = this.buildFluxPrompt(opts.prompt);

    console.log(`  🤗 Calling HuggingFace FLUX.1-schnell...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'image/jpeg,image/png,*/*',
      },
      body: JSON.stringify({
        inputs: cleanPrompt,
        parameters: {
          width: FLUX_DIMENSIONS.width,
          height: FLUX_DIMENSIONS.height,
          num_inference_steps: 4,    // FLUX.1-schnell optimal: 1-4 steps
          guidance_scale: 0.0,       // FLUX.1-schnell is guidance-distilled
        },
        options: {
          wait_for_model: true,      // Wait if model is loading (cold start)
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Detect specific error types for better messaging
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `HuggingFace auth failed (${response.status}). ` +
          `Check your HF_TOKEN in .env. Get a free token at: https://huggingface.co/settings/tokens`
        );
      }
      if (response.status === 503) {
        throw new Error(
          `HuggingFace model loading (503) — model may be cold. ` +
          `Try again in 30 seconds, or the pipeline will retry automatically.`
        );
      }
      throw new Error(`HuggingFace API error ${response.status}: ${errorText.slice(0, 200)}`);
    }

    // Response is binary image data (JPEG or PNG)
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    if (imageBuffer.length < 1000) {
      throw new Error(`HuggingFace returned suspiciously small image (${imageBuffer.length} bytes) — likely an error response.`);
    }

    // Save to disk
    const outputDir = path.dirname(opts.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // HF returns JPEG by default; ensure .jpg extension if needed
    const outputPath = opts.outputPath.replace(/\.png$/i, '.jpg');
    fs.writeFileSync(outputPath, imageBuffer);

    const stats = fs.statSync(outputPath);
    console.log(`  ✅ HuggingFace image saved: ${(stats.size / 1024).toFixed(1)}KB`);

    return {
      path: outputPath,
      mimeType: 'image/jpeg',
      sizeBytes: stats.size,
      dimensions: {
        width: FLUX_DIMENSIONS.width,
        height: FLUX_DIMENSIONS.height,
        label: 'Instagram Portrait (FLUX)',
      },
    };
  }

  /**
   * Rewrite a Bloom template prompt into a FLUX-friendly format.
   * FLUX works best with descriptive natural language, not labeled instructions.
   */
  private buildFluxPrompt(templatePrompt: string): string {
    // Extract the core visual description from the Bloom template prompt
    // Template prompts are long and instructional — trim to key visual elements
    const lines = templatePrompt.split('\n').filter(l => l.trim());

    // Keep meaningful visual description lines, skip meta-instructions
    const skipPhrases = [
      'create a', 'generate a', 'design a', 'make a', 'produce a',
      'instagram post', 'social media', 'aspect ratio', 'dimensions',
      'include these exact', 'slide', 'panel', 'section', 'layout',
      'font', 'typography', 'color palette:', 'hex:', '#',
    ];

    const visualLines = lines
      .filter(line => {
        const lower = line.toLowerCase();
        return !skipPhrases.some(skip => lower.startsWith(skip)) && line.length > 20;
      })
      .slice(0, 6); // Take top 6 most descriptive lines

    const corePrompt = visualLines.join('. ');

    // Prepend FLUX style tokens for best quality
    return `Detailed watercolor botanical illustration, educational infographic style. ${corePrompt}. Warm forest greens, earth tones, soft natural light, high detail, professional quality.`;
  }
}

// ─── HF Availability Check ──────────────────────────────────

/**
 * Returns a HuggingFaceClient if HF_TOKEN is present in the environment.
 * Returns null if no token is configured — caller should handle gracefully.
 */
export function getHuggingFaceClient(): HuggingFaceClient | null {
  const token = process.env.HF_TOKEN;
  if (!token || token === 'YOUR_HF_TOKEN_HERE' || token.trim() === '') {
    return null;
  }
  return new HuggingFaceClient(token.trim());
}

/**
 * Human-readable instructions for setting up the free HF token.
 */
export const HF_SETUP_INSTRUCTIONS = `
─────────────────────────────────────────────────
🤗 FREE IMAGE GENERATION — HuggingFace Setup
─────────────────────────────────────────────────
Takes ~2 minutes. No credit card required.

1. Sign up (free): https://huggingface.co/join
2. Get token:      https://huggingface.co/settings/tokens
   → Click "New token" → Name: "WildArc Bloom" → Type: Read → Generate
3. Copy the token (starts with hf_...)
4. Add to /Users/yogesh.zope/Desktop/tms/.env:
      HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxx
5. Done! Bloom will use FLUX.1-schnell for free (1000 images/day).
─────────────────────────────────────────────────
`;
