/**
 * WildArc Content Pipeline — Template Registry
 *
 * All content templates are defined here. To add a new template:
 * 1. Create a new ContentTemplate object
 * 2. Add it to the TEMPLATES map
 * 3. That's it — the CLI and scheduled task will auto-discover it
 *
 * Templates define the prompt engineering, visual style, and output format
 * for each content type. The Gemini API wrapper uses these to generate images.
 */

import { ContentTemplate, DIMENSIONS, WILDARC_PALETTE } from './types';

// ─── Shared Style Guides ─────────────────────────────────────

const WATERCOLOR_STYLE = `
Watercolor illustration style with soft, organic edges.
Earth-tone color palette: forest greens, warm browns, sky blues, gold accents.
Hand-drawn typography feel for titles (not generic fonts).
Labeled diagrams with thin connecting lines and callout boxes.
Soft paper-like texture in background.
Dense but scannable layout — information-rich without feeling cluttered.
Scientific accuracy in plant/nature illustrations.
`.trim();

const COMIC_STYLE = `
Clean comic panel illustration style.
Bold outlines with soft coloring.
Speech bubbles and thought clouds for dialogue.
Character expressions that convey emotion and learning.
Panel-by-panel sequential narrative flow.
Mix of close-ups and wide shots for visual variety.
Educational callout boxes integrated into panels.
Earth-tone color palette with occasional vibrant accents for emphasis.
`.trim();

const MINIMAL_MODERN_STYLE = `
Clean, minimal design with generous whitespace.
Bold sans-serif typography for titles and headers.
Flat icons and simple illustrations.
Limited color palette (3-4 colors max).
Strong visual hierarchy — title → key point → supporting details.
Grid-based layout with clear sections.
Data visualizations: simple bar charts, pie charts, icon arrays.
`.trim();

const VINTAGE_BOTANICAL_STYLE = `
Vintage scientific illustration style reminiscent of 18th-century botanical plates.
Detailed, anatomically accurate plant/nature drawings.
Sepia-toned background with aged paper texture.
Elegant serif typography with ornamental touches.
Labeled parts with fine lines and numbered references.
Cross-section diagrams and lifecycle illustrations.
Muted color palette with botanical greens, browns, and cream.
`.trim();

// ─── Template Definitions ────────────────────────────────────

const TEMPLATES: Map<string, ContentTemplate> = new Map();

// ═══════════════════════════════════════════════════════════════
// 1. SINGLE EDUCATIONAL INFOGRAPHIC (The Bamboo Style)
// ═══════════════════════════════════════════════════════════════

TEMPLATES.set('infographic-educational', {
  id: 'infographic-educational',
  name: 'Educational Infographic',
  description: 'Rich, illustrated educational poster with labeled diagrams, key facts, and practical tips. The classic WildArc bamboo infographic style.',
  format: 'single-infographic',
  style: 'watercolor-botanical',
  dimensions: DIMENSIONS.POSTER,
  systemPrompt: `You are a botanical education designer creating content for WildArc, a regenerative permaculture initiative in Coorg, India. Your infographics combine scientific accuracy with beautiful watercolor-style illustration.`,
  userPromptTemplate: `Create a single educational infographic poster about {topic}.

${WATERCOLOR_STYLE}

Layout requirements:
- Large, eye-catching title at center or top
- 4-6 key facts with labeled callout illustrations
- Practical tips section (how-to or growing guide)
- Detailed botanical/technical diagrams with labels
- Small WildArc branding mention in corner

Color palette: ${Object.values(WILDARC_PALETTE).join(', ')}

{details}

Output as a single high-quality image, 1200×1600px portrait orientation.`,
  negativePrompt: 'Avoid: photorealism, 3D rendering, clipart, generic stock imagery, gradients, drop shadows, neon colors, dark/gloomy mood',
  colorPalette: Object.values(WILDARC_PALETTE),
  styleGuide: WATERCOLOR_STYLE,
  suitableTopics: ['bamboo', 'coffee', 'permaculture', 'soil', 'water', 'biodiversity', 'composting', 'agroforestry'],
  tags: ['infographic', 'educational', 'poster', 'watercolor', 'botanical'],
  version: 1,
  createdAt: '2026-03-29',
  updatedAt: '2026-03-29',
});

// ═══════════════════════════════════════════════════════════════
// 2. CAROUSEL — STEP-BY-STEP TUTORIAL
// ═══════════════════════════════════════════════════════════════

TEMPLATES.set('carousel-tutorial', {
  id: 'carousel-tutorial',
  name: 'Step-by-Step Tutorial Carousel',
  description: '8-10 slide Instagram carousel with numbered steps. Each slide teaches one step with illustration + concise text.',
  format: 'carousel',
  style: 'watercolor-botanical',
  dimensions: DIMENSIONS.INSTAGRAM_PORTRAIT,
  slideCount: 8,
  systemPrompt: `You are creating an Instagram carousel for WildArc, a regenerative permaculture initiative. Each slide must be a self-contained visual that teaches one step. Maintain consistent style across all slides.`,
  slidePrompts: [
    // These are templates — {topic} and {step_N} get replaced at generation time
    `Create slide 1 (HOOK slide) for an Instagram carousel about {topic}.
This is the cover/title slide that makes people want to swipe.
Include: Bold title, eye-catching illustration, "Swipe →" visual cue.
${WATERCOLOR_STYLE}
Dimensions: 1080×1350px. Color palette: ${Object.values(WILDARC_PALETTE).join(', ')}`,

    `Create slide 2 for a tutorial carousel about {topic}. Step 1: {step_1}.
Show the first step with a clear illustration and 1-2 sentences of instruction.
Include a "Step 1" label and a small icon. Maintain watercolor botanical style.
Dimensions: 1080×1350px. Color palette: ${Object.values(WILDARC_PALETTE).join(', ')}`,

    `Create slide 3 for a tutorial carousel about {topic}. Step 2: {step_2}.
Show the second step. Maintain visual consistency with previous slides.
Include "Step 2" label. ${WATERCOLOR_STYLE}
Dimensions: 1080×1350px.`,

    `Create slide 4 for a tutorial carousel about {topic}. Step 3: {step_3}.
Show the third step. Same style as previous slides.
Include "Step 3" label. ${WATERCOLOR_STYLE}
Dimensions: 1080×1350px.`,

    `Create slide 5 for a tutorial carousel about {topic}. Step 4: {step_4}.
Show the fourth step. Same style as previous slides.
Include "Step 4" label. ${WATERCOLOR_STYLE}
Dimensions: 1080×1350px.`,

    `Create slide 6 for a tutorial carousel about {topic}. Step 5: {step_5}.
Show the fifth step. Same style as previous slides.
Include "Step 5" label. ${WATERCOLOR_STYLE}
Dimensions: 1080×1350px.`,

    `Create slide 7 for a tutorial carousel about {topic}. This is a "Pro Tips" or "Common Mistakes" slide.
Show 2-3 practical tips or warnings related to {topic}. Use icons and short text.
${WATERCOLOR_STYLE}
Dimensions: 1080×1350px.`,

    `Create slide 8 (FINAL slide) for a carousel about {topic}.
This is the CTA slide. Include:
- Summary of what was learned
- "Save this post" and "Share with a friend" call-to-action
- WildArc branding
- Clean, inviting design
${WATERCOLOR_STYLE}
Dimensions: 1080×1350px.`,
  ],
  userPromptTemplate: `Create a step-by-step tutorial carousel about {topic}.
The carousel should teach the process in 5 clear steps, plus a hook slide, tips slide, and CTA slide (8 slides total).

{details}`,
  negativePrompt: 'Avoid: inconsistent styles between slides, too much text, tiny fonts, photorealism, dark backgrounds',
  colorPalette: Object.values(WILDARC_PALETTE),
  styleGuide: WATERCOLOR_STYLE,
  suitableTopics: ['planting', 'composting', 'propagation', 'harvesting', 'building', 'soil-preparation', 'water-management'],
  tags: ['carousel', 'tutorial', 'step-by-step', 'instagram', 'how-to'],
  version: 1,
  createdAt: '2026-03-29',
  updatedAt: '2026-03-29',
});

// ═══════════════════════════════════════════════════════════════
// 3. COMIC STRIP — ILLUSTRATED LEARNING STORY
// ═══════════════════════════════════════════════════════════════

TEMPLATES.set('comic-learning', {
  id: 'comic-learning',
  name: 'Comic Learning Strip',
  description: 'Comic-panel style educational content that teaches through visual storytelling. 6-8 panels as carousel slides.',
  format: 'comic-strip',
  style: 'comic-panel',
  dimensions: DIMENSIONS.INSTAGRAM_PORTRAIT,
  slideCount: 6,
  systemPrompt: `You are creating an educational comic strip for WildArc. The comic uses visual storytelling to teach permaculture and sustainability concepts. Characters are friendly, relatable farmers/gardeners. Each panel advances both the story and the lesson.`,
  slidePrompts: [
    `Create comic panel 1 (OPENING) for a story about {topic}.
Introduce the setting (a farm/garden in Coorg) and the main character facing a problem or question about {topic}.
${COMIC_STYLE}
Include a speech bubble with the question/problem. 1080×1350px.`,

    `Create comic panel 2 for a comic about {topic}. The character discovers or learns: {lesson_1}.
Show the "aha moment" or discovery. Include educational callout box with the key fact.
${COMIC_STYLE} 1080×1350px.`,

    `Create comic panel 3 for a comic about {topic}. The character applies knowledge: {lesson_2}.
Show hands-on action. Include a "Did you know?" callout with a supporting fact.
${COMIC_STYLE} 1080×1350px.`,

    `Create comic panel 4 for a comic about {topic}. A challenge or twist: {lesson_3}.
Show a complication or common mistake. Include a "Watch out!" warning callout.
${COMIC_STYLE} 1080×1350px.`,

    `Create comic panel 5 for a comic about {topic}. The solution and result.
Show the character overcoming the challenge and seeing positive results.
Include a "Pro tip" callout. ${COMIC_STYLE} 1080×1350px.`,

    `Create comic panel 6 (CONCLUSION) for a comic about {topic}.
Show the happy ending — the thriving garden/farm. Include:
- Summary speech bubble with key takeaway
- "Follow WildArc for more" CTA
- Warm, satisfying visual conclusion
${COMIC_STYLE} 1080×1350px.`,
  ],
  userPromptTemplate: `Create an educational comic strip about {topic}.
The comic should tell a story of a farmer/gardener learning about {topic} through experience.
Key lessons to weave in: {details}`,
  negativePrompt: 'Avoid: realistic faces, violent imagery, overly complex panels, tiny text, dark/scary mood, manga/anime style',
  colorPalette: [WILDARC_PALETTE.forestGreen, WILDARC_PALETTE.earthBrown, WILDARC_PALETTE.creamWhite, WILDARC_PALETTE.goldAccent, WILDARC_PALETTE.skyBlue],
  styleGuide: COMIC_STYLE,
  suitableTopics: ['composting', 'pest-management', 'water-harvesting', 'soil-health', 'companion-planting', 'seed-saving', 'natural-building'],
  tags: ['comic', 'story', 'learning', 'illustrated', 'narrative'],
  version: 1,
  createdAt: '2026-03-29',
  updatedAt: '2026-03-29',
});

// ═══════════════════════════════════════════════════════════════
// 4. COMPARISON INFOGRAPHIC
// ═══════════════════════════════════════════════════════════════

TEMPLATES.set('infographic-comparison', {
  id: 'infographic-comparison',
  name: 'Side-by-Side Comparison',
  description: 'Visual comparison of two approaches, species, or methods. Split layout with clear pros/cons.',
  format: 'comparison',
  style: 'watercolor-botanical',
  dimensions: DIMENSIONS.INSTAGRAM_PORTRAIT,
  systemPrompt: `You are creating a comparison infographic for WildArc. The design clearly shows two options side by side with visual cues for differences and similarities.`,
  userPromptTemplate: `Create a side-by-side comparison infographic about {topic}.

Layout: Split the image vertically into two halves.
Left side: {option_a}
Right side: {option_b}

Include for each side:
- Illustration of the option
- 3-4 key characteristics with icons
- Pros and cons
- Best use cases

Center: Shared title at top, "vs" divider, summary at bottom.

${WATERCOLOR_STYLE}
Color palette: ${Object.values(WILDARC_PALETTE).join(', ')}
Dimensions: 1080×1350px.

{details}`,
  negativePrompt: 'Avoid: unbalanced layout, biased presentation, tiny text, photorealism',
  colorPalette: Object.values(WILDARC_PALETTE),
  styleGuide: WATERCOLOR_STYLE,
  suitableTopics: ['bamboo-varieties', 'composting-methods', 'irrigation-types', 'soil-amendments', 'growing-techniques'],
  tags: ['comparison', 'vs', 'side-by-side', 'decision-helper'],
  version: 1,
  createdAt: '2026-03-29',
  updatedAt: '2026-03-29',
});

// ═══════════════════════════════════════════════════════════════
// 5. SPECIES / TECHNIQUE PROFILE
// ═══════════════════════════════════════════════════════════════

TEMPLATES.set('species-profile', {
  id: 'species-profile',
  name: 'Species / Technique Deep-Dive',
  description: 'Detailed profile of a single species or technique with vintage botanical illustration style.',
  format: 'species-profile',
  style: 'vintage-botanical',
  dimensions: DIMENSIONS.POSTER,
  systemPrompt: `You are creating a detailed species or technique profile in the style of vintage botanical illustration plates. Scientific accuracy is paramount.`,
  userPromptTemplate: `Create a detailed profile illustration of {topic}.

${VINTAGE_BOTANICAL_STYLE}

Include:
- Central detailed illustration of the species/technique
- Cross-section or lifecycle diagram
- Labeled anatomical parts with numbered references
- Key data box: habitat, growing conditions, uses, seasonal timing
- Classification or category information
- Scale reference where appropriate

Title: "{topic}" in elegant serif typography
Subtitle: Scientific name or technical classification

Dimensions: 1200×1600px portrait.

{details}`,
  negativePrompt: 'Avoid: cartoon style, modern flat design, 3D rendering, bright neon colors, cluttered layout',
  colorPalette: ['#2F6135', '#8B5E3C', '#F5F0E8', '#C4956A', '#1A3D1F'],
  styleGuide: VINTAGE_BOTANICAL_STYLE,
  suitableTopics: ['bamboo-species', 'native-trees', 'medicinal-plants', 'pollinators', 'soil-organisms', 'fungi', 'birds'],
  tags: ['species', 'profile', 'botanical', 'vintage', 'scientific'],
  version: 1,
  createdAt: '2026-03-29',
  updatedAt: '2026-03-29',
});

// ═══════════════════════════════════════════════════════════════
// 6. DATA VISUALIZATION / FACTS & FIGURES
// ═══════════════════════════════════════════════════════════════

TEMPLATES.set('data-facts', {
  id: 'data-facts',
  name: 'Facts & Figures Visualization',
  description: 'Clean, modern infographic focused on data, statistics, and key figures. Minimal style with bold numbers.',
  format: 'data-visualization',
  style: 'minimal-modern',
  dimensions: DIMENSIONS.INSTAGRAM_PORTRAIT,
  systemPrompt: `You are creating a data-focused infographic for WildArc. Prioritize clarity, readability, and visual impact of numbers and statistics.`,
  userPromptTemplate: `Create a facts and figures infographic about {topic}.

${MINIMAL_MODERN_STYLE}

Include:
- Bold headline with the most surprising statistic
- 4-6 key data points, each with a large number and short description
- Simple icons or illustrations for each data point
- One mini chart or graph (bar, pie, or comparison)
- Source attribution at bottom
- WildArc branding

Color palette: ${WILDARC_PALETTE.forestGreen}, ${WILDARC_PALETTE.goldAccent}, ${WILDARC_PALETTE.creamWhite}, ${WILDARC_PALETTE.deepGreen}
Dimensions: 1080×1350px.

{details}`,
  negativePrompt: 'Avoid: watercolor style, hand-drawn elements, complex charts, too many colors, tiny text, photorealism',
  colorPalette: [WILDARC_PALETTE.forestGreen, WILDARC_PALETTE.goldAccent, WILDARC_PALETTE.creamWhite, WILDARC_PALETTE.deepGreen],
  styleGuide: MINIMAL_MODERN_STYLE,
  suitableTopics: ['bamboo-facts', 'deforestation', 'carbon-sequestration', 'water-usage', 'biodiversity-stats', 'farming-economics'],
  tags: ['data', 'facts', 'statistics', 'numbers', 'visualization', 'modern'],
  version: 1,
  createdAt: '2026-03-29',
  updatedAt: '2026-03-29',
});

// ═══════════════════════════════════════════════════════════════
// 7. SEASONAL CALENDAR
// ═══════════════════════════════════════════════════════════════

TEMPLATES.set('seasonal-calendar', {
  id: 'seasonal-calendar',
  name: 'Seasonal Activity Calendar',
  description: 'Month-by-month or season-by-season guide showing what to do in the garden/farm.',
  format: 'seasonal-calendar',
  style: 'watercolor-botanical',
  dimensions: DIMENSIONS.POSTER,
  systemPrompt: `You are creating a seasonal calendar infographic for WildArc, specific to the Coorg, India climate (tropical highland, monsoon-influenced).`,
  userPromptTemplate: `Create a seasonal calendar infographic for {topic} in Coorg, India.

${WATERCOLOR_STYLE}

Layout: Divide into seasonal sections (or months), each with:
- Season/month name with appropriate weather icon
- 2-3 key activities with small illustrations
- Plant/harvest timing indicators
- Rainfall/temperature context

Include: Title at top, Coorg-specific climate notes, monsoon timing (June-September).

Color palette: ${Object.values(WILDARC_PALETTE).join(', ')}
Dimensions: 1200×1600px.

{details}`,
  negativePrompt: 'Avoid: generic/temperate climate advice, photorealism, cluttered layout, tiny text',
  colorPalette: Object.values(WILDARC_PALETTE),
  styleGuide: WATERCOLOR_STYLE,
  suitableTopics: ['food-forest', 'coffee-cultivation', 'bamboo-management', 'vegetable-garden', 'composting-cycle', 'water-management'],
  tags: ['calendar', 'seasonal', 'monthly', 'planning', 'coorg'],
  version: 1,
  createdAt: '2026-03-29',
  updatedAt: '2026-03-29',
});

// ─── Template Registry API ───────────────────────────────────

export function getTemplate(id: string): ContentTemplate | undefined {
  return TEMPLATES.get(id);
}

export function listTemplates(): ContentTemplate[] {
  return Array.from(TEMPLATES.values());
}

export function getTemplatesByFormat(format: string): ContentTemplate[] {
  return listTemplates().filter(t => t.format === format);
}

export function getTemplatesByTag(tag: string): ContentTemplate[] {
  return listTemplates().filter(t => t.tags.includes(tag));
}

export function searchTemplates(query: string): ContentTemplate[] {
  const q = query.toLowerCase();
  return listTemplates().filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q)) ||
    t.suitableTopics.some(topic => topic.includes(q))
  );
}

/**
 * Fill a prompt template with variables.
 * Replaces {topic}, {details}, {step_N}, {lesson_N}, {option_a}, {option_b}, etc.
 */
export function fillPromptTemplate(template: string, vars: Record<string, string>): string {
  let filled = template;
  for (const [key, value] of Object.entries(vars)) {
    filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  }
  // Remove any unfilled placeholders
  filled = filled.replace(/\{[a-z_]+\}/g, '');
  return filled;
}
