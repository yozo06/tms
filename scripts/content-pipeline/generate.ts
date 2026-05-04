/**
 * WildArc Content Pipeline — Generation Engine
 *
 * Orchestrates the full generation workflow:
 * 1. Load template + resolve references
 * 2. Build prompts with topic/details
 * 3. Call Gemini for image generation
 * 4. Run quality checks
 * 5. Save results with metadata
 */

import * as fs from 'fs';
import * as path from 'path';
import { GeminiClient, runQualityChecks } from './gemini';
import { getTemplate, fillPromptTemplate, listTemplates } from './templates';
import {
  GenerationRequest,
  GenerationResult,
  GeneratedImage,
  PipelineConfig,
  ContentTemplate,
} from './types';

// ─── Configuration ───────────────────────────────────────────

function loadConfig(): PipelineConfig {
  // Load from environment or .env
  const projectRoot = path.resolve(__dirname, '../..');

  // Try to load .env manually if dotenv not available
  const envPath = path.join(projectRoot, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY not found. Add it to your .env file:\n' +
      'GEMINI_API_KEY=your_key_here\n\n' +
      'Get a key from: https://aistudio.google.com/apikey'
    );
  }

  return {
    geminiApiKey: apiKey,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    outputDir: path.join(projectRoot, 'content', 'generated'),
    referencesDir: path.join(projectRoot, 'content', 'references'),
    templatesDir: path.join(projectRoot, 'content', 'templates'),
    maxRetries: 2,
    defaultDimensions: { width: 1080, height: 1350, label: 'Instagram Portrait' },
    defaultStyle: 'watercolor-botanical',
    defaultColorPalette: ['#2F6135', '#8B5E3C', '#79BCE0', '#D8A419', '#F5F0E8'],
  };
}

// ─── Main Generation Function ────────────────────────────────

export async function generate(request: GenerationRequest): Promise<GenerationResult> {
  const config = loadConfig();
  const client = new GeminiClient(config);
  const startTime = Date.now();

  // Load template
  const template = getTemplate(request.templateId);
  if (!template) {
    const available = listTemplates().map(t => `  ${t.id} — ${t.name}`).join('\n');
    throw new Error(`Template "${request.templateId}" not found.\n\nAvailable templates:\n${available}`);
  }

  console.log(`\n🌿 WildArc Content Pipeline`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Template:  ${template.name}`);
  console.log(`Format:    ${template.format}`);
  console.log(`Topic:     ${request.topic}`);
  console.log(`Style:     ${template.style}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Resolve reference images
  const referenceImages = resolveReferences(config, request, template);
  if (referenceImages.length > 0) {
    console.log(`📸 Using ${referenceImages.length} reference image(s)`);
  }

  // Create output directory
  const dateStr = new Date().toISOString().split('T')[0];
  const monthDir = dateStr.substring(0, 7); // YYYY-MM
  const topicSlug = request.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
  const outputDir = path.join(config.outputDir, monthDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate based on format
  let images: GeneratedImage[] = [];
  let totalTokens = 0;

  const isMultiSlide = template.format === 'carousel' || template.format === 'comic-strip';

  if (isMultiSlide && template.slidePrompts?.length) {
    // ── Multi-slide generation (carousel / comic) ──
    console.log(`🎨 Generating ${template.slidePrompts.length} slides...\n`);

    const slidePrompts = template.slidePrompts.map((prompt, i) => {
      const vars: Record<string, string> = {
        topic: request.topic,
        details: request.details || '',
      };

      // Fill step/lesson variables from slideTopics
      if (request.slideTopics) {
        request.slideTopics.forEach((st, idx) => {
          vars[`step_${idx + 1}`] = st;
          vars[`lesson_${idx + 1}`] = st;
        });
      }

      return fillPromptTemplate(prompt, vars);
    });

    const result = await client.generateCarousel({
      slidePrompts,
      referenceImages,
      outputDir,
      dimensions: template.dimensions,
      filenamePrefix: `${dateStr}_${topicSlug}`,
    });

    images = result.images;
    totalTokens = result.totalTokens;
  } else {
    // ── Single image generation ──
    console.log(`🎨 Generating image...\n`);

    const prompt = fillPromptTemplate(template.userPromptTemplate, {
      topic: request.topic,
      details: request.details || '',
      option_a: request.slideTopics?.[0] || '',
      option_b: request.slideTopics?.[1] || '',
    });

    const outputPath = path.join(outputDir, `${dateStr}_${topicSlug}.png`);

    // Retry logic
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`  🔄 Retry attempt ${attempt}/${config.maxRetries + 1}...`);
        }

        const result = await client.generateImage({
          prompt: attempt === 1 ? prompt : `${prompt}\n\n[Note: Please ensure the image is complete, high-quality, and matches the requested style. Previous attempt had issues.]`,
          referenceImages,
          outputPath,
          dimensions: template.dimensions,
        });

        images = [result.image];
        totalTokens = result.promptTokens;
        lastError = null;
        break;
      } catch (err) {
        lastError = err as Error;
        console.error(`  ⚠️ Attempt ${attempt} failed: ${lastError.message}`);
        if (attempt < config.maxRetries + 1) {
          await new Promise(r => setTimeout(r, 3000)); // Wait before retry
        }
      }
    }

    if (lastError) {
      throw new Error(`Generation failed after ${config.maxRetries + 1} attempts: ${lastError.message}`);
    }
  }

  // Run quality checks
  const qualityChecks = runQualityChecks(images);
  const overallPass = qualityChecks.every(c => c.passed);

  // Generate caption
  const caption = generateCaption(template, request);
  const hashtags = generateHashtags(template, request);

  // Build result
  const result: GenerationResult = {
    id: `gen_${Date.now()}_${topicSlug}`,
    request,
    template,
    images,
    caption,
    hashtags,
    model: config.geminiModel,
    promptTokens: totalTokens,
    generationTimeMs: Date.now() - startTime,
    createdAt: new Date().toISOString(),
    qualityChecks,
    overallPass,
  };

  // Save metadata
  const metadataPath = path.join(outputDir, `${dateStr}_${topicSlug}_metadata.json`);
  fs.writeFileSync(metadataPath, JSON.stringify({
    id: result.id,
    template: { id: template.id, name: template.name, version: template.version },
    topic: request.topic,
    details: request.details,
    images: images.map(img => ({
      path: path.relative(config.outputDir, img.path),
      slideIndex: img.slideIndex,
      sizeBytes: img.sizeBytes,
    })),
    caption,
    hashtags,
    model: result.model,
    generationTimeMs: result.generationTimeMs,
    qualityChecks,
    overallPass,
    createdAt: result.createdAt,
  }, null, 2));

  // Print summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Generation complete!`);
  console.log(`   Images: ${images.length}`);
  console.log(`   Quality: ${overallPass ? '✅ PASS' : '⚠️ CHECK NEEDED'}`);
  console.log(`   Time: ${(result.generationTimeMs / 1000).toFixed(1)}s`);
  console.log(`   Output: ${outputDir}`);
  console.log(`   Metadata: ${path.basename(metadataPath)}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (!overallPass) {
    console.log(`⚠️ Quality check issues:`);
    for (const check of qualityChecks.filter(c => !c.passed)) {
      console.log(`   ❌ ${check.name}: ${check.details}`);
    }
    console.log();
  }

  return result;
}

// ─── Helper Functions ────────────────────────────────────────

function resolveReferences(
  config: PipelineConfig,
  request: GenerationRequest,
  template: ContentTemplate
): string[] {
  const refs: string[] = [];

  // Explicit references from request
  if (request.referenceImages?.length) {
    for (const ref of request.referenceImages) {
      const fullPath = path.isAbsolute(ref) ? ref : path.join(config.referencesDir, ref);
      if (fs.existsSync(fullPath)) {
        refs.push(fullPath);
      } else {
        console.warn(`  Reference image not found: ${ref}`);
      }
    }
  }

  // Template default references
  if (template.referenceImageIds?.length && refs.length === 0) {
    for (const refId of template.referenceImageIds) {
      const refPath = path.join(config.referencesDir, refId);
      if (fs.existsSync(refPath)) {
        refs.push(refPath);
      }
    }
  }

  // Auto-discover references by style if none specified
  if (refs.length === 0) {
    const styleDir = path.join(config.referencesDir, template.style);
    if (fs.existsSync(styleDir)) {
      const files = fs.readdirSync(styleDir).filter(f =>
        /\.(png|jpg|jpeg|webp)$/i.test(f)
      );
      // Pick up to 2 random references
      const shuffled = files.sort(() => Math.random() - 0.5);
      for (const file of shuffled.slice(0, 2)) {
        refs.push(path.join(styleDir, file));
      }
    }
  }

  return refs;
}

function generateCaption(template: ContentTemplate, request: GenerationRequest): string {
  const topicTitle = request.topic.split(' ').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');

  const formatCaptions: Record<string, string> = {
    'single-infographic': `🌿 ${topicTitle}\n\nLearn about ${request.topic} with this illustrated guide from WildArc.\n\n${request.details || 'Save this for your permaculture journey!'}\n\n`,
    'carousel': `🌿 ${topicTitle} — A Step-by-Step Guide\n\nSwipe through to learn the complete process → \n\n${request.details || ''}\n\n💾 Save this for later!\n\n`,
    'comic-strip': `🌿 ${topicTitle} — A Learning Story\n\nFollow along as we discover ${request.topic} through this illustrated story.\n\n${request.details || ''}\n\n`,
    'comparison': `🌿 ${topicTitle}\n\nWhich approach is right for you? Swipe to compare →\n\n${request.details || ''}\n\n`,
    'species-profile': `🌿 ${topicTitle} — Species Profile\n\nDive deep into the characteristics, habitat, and uses of ${request.topic}.\n\n${request.details || ''}\n\n`,
    'data-visualization': `📊 ${topicTitle} — By The Numbers\n\nKey facts and figures about ${request.topic}.\n\n${request.details || ''}\n\n`,
    'seasonal-calendar': `📅 ${topicTitle} — Seasonal Guide for Coorg\n\nYour month-by-month guide to ${request.topic} in the Western Ghats.\n\n${request.details || ''}\n\n`,
  };

  return formatCaptions[template.format] || `🌿 ${topicTitle}\n\n${request.details || ''}\n\n`;
}

function generateHashtags(template: ContentTemplate, request: GenerationRequest): string[] {
  const base = ['#WildArc', '#Permaculture', '#Coorg', '#RegenerativeLiving', '#Sustainability'];
  const topicTags = request.topic.split(' ')
    .filter(w => w.length > 3)
    .map(w => `#${w.charAt(0).toUpperCase()}${w.slice(1)}`);

  const formatTags: Record<string, string[]> = {
    'carousel': ['#CarouselPost', '#LearnOnInstagram', '#EducationalContent'],
    'comic-strip': ['#ComicStrip', '#LearnThroughStories', '#VisualLearning'],
    'single-infographic': ['#Infographic', '#VisualGuide', '#LearnSomethingNew'],
    'data-visualization': ['#DataViz', '#FactsAndFigures', '#DidYouKnow'],
  };

  const styleTags = template.tags.map(t => `#${t.charAt(0).toUpperCase()}${t.slice(1)}`);

  return [...new Set([
    ...base,
    ...(formatTags[template.format] || []),
    ...topicTags.slice(0, 5),
    ...styleTags.slice(0, 3),
  ])].slice(0, 30); // Instagram max: 30 hashtags
}
