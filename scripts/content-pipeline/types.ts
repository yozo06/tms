/**
 * WildArc Content Pipeline — Type Definitions
 *
 * Flexible, extensible type system for multi-format content generation.
 * Supports: infographics, carousels, comic strips, and custom formats.
 */

// ─── Content Format Types ────────────────────────────────────

export type ContentFormat =
  | 'single-infographic'    // Single educational poster (like the bamboo images)
  | 'carousel'              // Multi-slide Instagram carousel (8-12 slides)
  | 'comic-strip'           // Illustrated comic-style learning sequence
  | 'step-by-step'          // Numbered step-by-step tutorial
  | 'comparison'            // Side-by-side comparison (e.g., clumping vs running bamboo)
  | 'species-profile'       // Deep-dive on a single species/technique
  | 'seasonal-calendar'     // Monthly/seasonal what-to-do guide
  | 'data-visualization'    // Facts, figures, statistics poster
  | 'custom';               // User-defined format

export type ImageDimension = {
  width: number;
  height: number;
  label: string;            // e.g., "Instagram Portrait", "Square", "Story"
};

export type StylePreset =
  | 'watercolor-botanical'  // Soft watercolor with labeled diagrams (the bamboo style)
  | 'minimal-modern'        // Clean, minimalist with icons and bold text
  | 'hand-drawn-sketch'     // Sketchy, notebook-style illustrations
  | 'comic-panel'           // Comic book panel style with speech bubbles
  | 'photo-realistic'       // Photo-quality renders
  | 'infographic-flat'      // Flat design infographic style
  | 'vintage-botanical'     // Vintage scientific illustration style
  | 'custom';

// ─── Template Definition ─────────────────────────────────────

export interface ContentTemplate {
  id: string;                          // Unique template ID (kebab-case)
  name: string;                        // Human-readable name
  description: string;                 // What this template produces
  format: ContentFormat;               // Content format type
  style: StylePreset;                  // Visual style preset

  // Dimensions
  dimensions: ImageDimension;          // Primary output dimensions
  slideCount?: number;                 // For carousels/comics: number of slides

  // Prompt Engineering
  systemPrompt: string;                // Persistent style/context instructions
  slidePrompts?: string[];             // Per-slide prompts (for carousels)
  userPromptTemplate: string;          // Template with {topic}, {details} placeholders
  negativePrompt: string;              // What to avoid

  // Style Anchoring
  colorPalette: string[];              // Hex color codes
  referenceImageIds?: string[];        // IDs of reference images to include
  styleGuide: string;                  // Text description of visual style

  // Metadata
  suitableTopics: string[];            // Topic categories this works for
  tags: string[];                      // Searchable tags
  version: number;                     // Template version
  createdAt: string;
  updatedAt: string;
}

// ─── Generation Request ──────────────────────────────────────

export interface GenerationRequest {
  templateId: string;                  // Which template to use
  topic: string;                       // The topic to generate about
  details?: string;                    // Additional context/details
  referenceImages?: string[];          // Paths to reference images
  overrides?: Partial<ContentTemplate>; // Override any template field
  slideTopics?: string[];              // Per-slide topics (for carousels)
  batchId?: string;                    // Group related generations
}

// ─── Generation Result ───────────────────────────────────────

export interface GenerationResult {
  id: string;                          // Unique generation ID
  request: GenerationRequest;          // Original request
  template: ContentTemplate;           // Template used

  // Output
  images: GeneratedImage[];            // Generated image(s)
  caption: string;                     // Generated caption
  hashtags: string[];                  // Suggested hashtags

  // Metadata
  model: string;                       // Gemini model used
  promptTokens: number;
  generationTimeMs: number;
  createdAt: string;

  // Quality
  qualityChecks: QualityCheck[];
  overallPass: boolean;
}

export interface GeneratedImage {
  path: string;                        // Local file path
  slideIndex?: number;                 // For carousels: which slide
  mimeType: string;
  sizeBytes: number;
  dimensions: ImageDimension;
}

export interface QualityCheck {
  name: string;                        // e.g., "dimensions", "file_size", "has_content"
  passed: boolean;
  details: string;
}

// ─── Reference Image ─────────────────────────────────────────

export interface ReferenceImage {
  id: string;
  path: string;
  name: string;
  description: string;
  style: StylePreset;
  colorPalette: string[];
  suitableFormats: ContentFormat[];
  tags: string[];
  addedAt: string;
}

// ─── Pipeline Configuration ──────────────────────────────────

export interface PipelineConfig {
  geminiApiKey: string;
  geminiModel: string;
  outputDir: string;
  referencesDir: string;
  templatesDir: string;
  maxRetries: number;
  defaultDimensions: ImageDimension;
  defaultStyle: StylePreset;
  defaultColorPalette: string[];
}

// ─── Constants ───────────────────────────────────────────────

export const DIMENSIONS = {
  INSTAGRAM_PORTRAIT: { width: 1080, height: 1350, label: 'Instagram Portrait (4:5)' },
  INSTAGRAM_SQUARE: { width: 1080, height: 1080, label: 'Instagram Square (1:1)' },
  INSTAGRAM_STORY: { width: 1080, height: 1920, label: 'Instagram Story (9:16)' },
  LANDSCAPE: { width: 1200, height: 675, label: 'Landscape (16:9)' },
  POSTER: { width: 1200, height: 1600, label: 'Poster (3:4)' },
} as const;

export const WILDARC_PALETTE = {
  forestGreen: '#2F6135',
  earthBrown: '#8B5E3C',
  skyBlue: '#79BCE0',
  goldAccent: '#D8A419',
  creamWhite: '#F5F0E8',
  deepGreen: '#1A3D1F',
  warmOchre: '#C4956A',
  mistyGray: '#B8C5B8',
} as const;
