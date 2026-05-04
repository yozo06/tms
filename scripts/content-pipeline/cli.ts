#!/usr/bin/env npx ts-node
/**
 * WildArc Content Pipeline — CLI
 *
 * Usage:
 *   npx ts-node scripts/content-pipeline/cli.ts <command> [options]
 *
 * Commands:
 *   generate   Generate content from a template
 *   list       List available templates
 *   info       Show template details
 *
 * Examples:
 *   # List all templates
 *   npx ts-node scripts/content-pipeline/cli.ts list
 *
 *   # Generate a single infographic
 *   npx ts-node scripts/content-pipeline/cli.ts generate \
 *     --template infographic-educational \
 *     --topic "How to grow bamboo from cuttings" \
 *     --details "Focus on Dendrocalamus asper variety suitable for Coorg climate"
 *
 *   # Generate a carousel with step topics
 *   npx ts-node scripts/content-pipeline/cli.ts generate \
 *     --template carousel-tutorial \
 *     --topic "Building a compost pile" \
 *     --steps "Choose location,Layer browns and greens,Add water,Turn weekly,Harvest compost"
 *
 *   # Generate with a reference image
 *   npx ts-node scripts/content-pipeline/cli.ts generate \
 *     --template infographic-educational \
 *     --topic "Water harvesting in Coorg" \
 *     --ref content/references/bamboo-architecture.png
 *
 *   # Generate a comparison
 *   npx ts-node scripts/content-pipeline/cli.ts generate \
 *     --template infographic-comparison \
 *     --topic "Clumping vs Running Bamboo" \
 *     --steps "Clumping Bamboo (Bambusa),Running Bamboo (Phyllostachys)"
 *
 *   # Generate a comic strip
 *   npx ts-node scripts/content-pipeline/cli.ts generate \
 *     --template comic-learning \
 *     --topic "Why mulching matters" \
 *     --steps "Mulch retains moisture,Suppresses weeds naturally,Feeds soil organisms"
 */

import { generate } from './generate';
import { listTemplates, getTemplate, searchTemplates } from './templates';
import { GenerationRequest } from './types';

// ─── Argument Parsing ────────────────────────────────────────

function parseArgs(): { command: string; options: Record<string, string> } {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
      options[key] = value;
      if (value !== 'true') i++;
    }
  }

  return { command, options };
}

// ─── Commands ────────────────────────────────────────────────

async function cmdList(options: Record<string, string>) {
  const templates = options.search ? searchTemplates(options.search) : listTemplates();

  console.log(`\n🌿 WildArc Content Templates (${templates.length})\n`);
  console.log('━'.repeat(70));

  for (const t of templates) {
    const slideInfo = t.slideCount ? ` (${t.slideCount} slides)` : '';
    console.log(`\n  ${t.id}`);
    console.log(`  ${t.name}${slideInfo}`);
    console.log(`  ${t.description}`);
    console.log(`  Format: ${t.format} | Style: ${t.style}`);
    console.log(`  Tags: ${t.tags.join(', ')}`);
  }

  console.log('\n' + '━'.repeat(70));
  console.log(`\nUsage: npx ts-node scripts/content-pipeline/cli.ts generate --template <id> --topic "..."\n`);
}

function cmdInfo(options: Record<string, string>) {
  const templateId = options.template;
  if (!templateId) {
    console.error('Error: --template <id> is required');
    process.exit(1);
  }

  const template = getTemplate(templateId);
  if (!template) {
    console.error(`Template "${templateId}" not found. Run "list" to see available templates.`);
    process.exit(1);
  }

  console.log(`\n🌿 Template: ${template.name}\n`);
  console.log(`ID:          ${template.id}`);
  console.log(`Format:      ${template.format}`);
  console.log(`Style:       ${template.style}`);
  console.log(`Dimensions:  ${template.dimensions.width}×${template.dimensions.height} (${template.dimensions.label})`);
  if (template.slideCount) {
    console.log(`Slides:      ${template.slideCount}`);
  }
  console.log(`Version:     ${template.version}`);
  console.log(`\nDescription: ${template.description}`);
  console.log(`\nSuitable topics: ${template.suitableTopics.join(', ')}`);
  console.log(`Tags: ${template.tags.join(', ')}`);
  console.log(`\nColor palette: ${template.colorPalette.join(', ')}`);
  console.log(`\nPrompt template (first 200 chars):`);
  console.log(`  ${template.userPromptTemplate.substring(0, 200)}...`);
  console.log();
}

async function cmdGenerate(options: Record<string, string>) {
  const templateId = options.template;
  const topic = options.topic;

  if (!templateId || !topic) {
    console.error('Error: --template <id> and --topic "..." are required');
    console.error('Run "list" to see available templates.');
    process.exit(1);
  }

  // Parse steps/slideTopics
  const slideTopics = options.steps?.split(',').map(s => s.trim()) || undefined;

  // Parse reference images
  const referenceImages = options.ref?.split(',').map(s => s.trim()) || undefined;

  const request: GenerationRequest = {
    templateId,
    topic,
    details: options.details || '',
    referenceImages,
    slideTopics,
  };

  try {
    const result = await generate(request);

    // Print results
    console.log(`📝 Caption:`);
    console.log(result.caption);
    console.log(`🏷️ Hashtags:`);
    console.log(result.hashtags.join(' '));
    console.log();

    if (result.images.length > 0) {
      console.log(`📁 Generated files:`);
      for (const img of result.images) {
        const slideLabel = img.slideIndex !== undefined ? ` (slide ${img.slideIndex + 1})` : '';
        console.log(`   ${img.path}${slideLabel} — ${(img.sizeBytes / 1024).toFixed(1)}KB`);
      }
    }
  } catch (err) {
    console.error(`\n❌ Generation failed: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

function cmdHelp() {
  console.log(`
🌿 WildArc Content Pipeline

Commands:
  list                          List all available templates
  list --search <query>         Search templates by keyword
  info --template <id>          Show template details
  generate --template <id>      Generate content
           --topic "..."        Topic to generate about
           --details "..."      Additional context (optional)
           --steps "a,b,c"      Step/slide topics, comma-separated (optional)
           --ref path.png       Reference image path (optional)

Quick start:
  npx ts-node scripts/content-pipeline/cli.ts list
  npx ts-node scripts/content-pipeline/cli.ts generate --template infographic-educational --topic "Bamboo propagation methods"
`);
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  const { command, options } = parseArgs();

  switch (command) {
    case 'list':
      await cmdList(options);
      break;
    case 'info':
      cmdInfo(options);
      break;
    case 'generate':
      await cmdGenerate(options);
      break;
    case 'help':
    default:
      cmdHelp();
      break;
  }
}

main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
