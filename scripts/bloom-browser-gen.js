#!/usr/bin/env node
/**
 * 🌸 WildArc Bloom — Browser Image Generator
 *
 * Generates images using gemini.google.com (free tier) via Playwright.
 * No API billing required. Uses your existing Google login.
 * All output is Instagram-portrait ratio (4:5 = 1080×1350px).
 *
 * ONE-TIME SETUP:
 *   node scripts/bloom-browser-gen.js --setup
 *
 * LIST TEMPLATES:
 *   node scripts/bloom-browser-gen.js --list-templates
 *
 * GENERATE with a template:
 *   node scripts/bloom-browser-gen.js \
 *     --template infographic-educational \
 *     --topic "Bamboo growing in Coorg" \
 *     --output content/bloom/generated/2026-03/image.jpg
 *
 * GENERATE with a raw prompt (ratio enforcement still applied):
 *   node scripts/bloom-browser-gen.js \
 *     --prompt "Create an educational infographic about bamboo" \
 *     --output content/bloom/generated/2026-03/image.jpg
 *
 * CHECK LOGIN STATUS:
 *   node scripts/bloom-browser-gen.js --check
 *
 * DEBUG (headed browser):
 *   node scripts/bloom-browser-gen.js --template infographic-educational \
 *     --topic "Bamboo" --output ... --headed
 */

const path = require('path');
const fs   = require('fs');

// ─── Template Registry (JS mirror of templates.ts) ────────────
// These match the 7 templates in src/modules/bloom/pipeline/templates.ts
// Prompt always ends with Instagram portrait ratio instruction.

// Appended to every prompt — phrased naturally so Gemini treats it as part of the image request
const INSTAGRAM_RATIO = ` Generate in portrait orientation (4:5 ratio) suitable for Instagram.`;

const WATERCOLOR_STYLE = `Watercolor illustration style with soft, organic edges. Earth-tone color palette: forest greens, warm browns, sky blues, gold accents. Hand-drawn typography feel. Labeled diagrams with thin connecting lines. Soft paper-like texture in background. Dense but scannable layout. Scientific accuracy in nature illustrations.`;

const VINTAGE_STYLE = `Vintage scientific illustration style (18th-century botanical plates). Detailed, anatomically accurate drawings. Sepia-toned background with aged paper texture. Elegant serif typography. Labeled parts with fine lines. Muted palette: botanical greens, browns, cream.`;

const MINIMAL_STYLE = `Clean minimal design with generous whitespace. Bold sans-serif typography. Flat icons. Limited 3-4 color palette. Strong visual hierarchy. Grid-based layout. Simple charts and icon arrays.`;

const COMIC_STYLE = `Clean comic panel illustration style. Bold outlines with soft coloring. Speech bubbles and thought clouds. Character expressions conveying emotion. Panel-by-panel narrative. Mix of close-ups and wide shots. Educational callout boxes.`;

// CRITICAL: Describe a VISUAL SCENE, not a "poster" or "infographic" or "chart".
// Gemini generates images of things you can SEE — not design documents.
// Good: "a detailed watercolor illustration showing coffee plants under forest canopy with labeled arrows"
// Bad:  "a watercolor educational poster about coffee" → Gemini writes TEXT instead.
const TEMPLATES = {
  'infographic-educational': {
    name: 'Educational Infographic',
    description: 'Rich watercolor scene with labeled botanical diagrams and key facts. Classic WildArc style.',
    style: 'watercolor-botanical',
    suitableTopics: 'bamboo, coffee, permaculture, soil, water, biodiversity, composting, agroforestry',
    buildPrompt: (topic, details) =>
      `Generate an image showing a detailed watercolor botanical illustration of ${topic} with fine annotation arrows pointing to key parts, small inset diagrams, hand-lettered labels in earth tones (forest green, warm brown, gold), soft paper texture, scientific drawing style.${details ? ' ' + details : ''}${INSTAGRAM_RATIO}`,
  },

  'carousel-tutorial': {
    name: 'Step-by-Step Tutorial (Carousel cover)',
    description: 'Eye-catching illustrated cover for an Instagram carousel tutorial.',
    style: 'watercolor-botanical',
    suitableTopics: 'planting, composting, propagation, harvesting, building, soil-preparation, water-management',
    buildPrompt: (topic, details) =>
      `Generate an image showing a lush watercolor botanical scene of ${topic} with a bold hand-lettered title at the top and a small "Swipe →" arrow at the bottom, earthy forest greens and warm browns, soft brushwork style.${details ? ' ' + details : ''}${INSTAGRAM_RATIO}`,
  },

  'comic-learning': {
    name: 'Comic Learning Panel',
    description: 'Educational comic panel — farmer character, speech bubble, storytelling style.',
    style: 'comic-panel',
    suitableTopics: 'composting, pest-management, water-harvesting, soil-health, companion-planting, seed-saving',
    buildPrompt: (topic, details) =>
      `Generate an image showing a comic illustration of a friendly Indian farmer standing in a Coorg farm, looking curiously at ${topic}, with a speech bubble asking a question about it. Bold outlines, soft warm colors, earthy tones, simple background of green fields.${details ? ' ' + details : ''}${INSTAGRAM_RATIO}`,
  },

  'infographic-comparison': {
    name: 'Side-by-Side Comparison',
    description: 'Illustrated visual comparing two approaches or species.',
    style: 'watercolor-botanical',
    suitableTopics: 'bamboo varieties, composting methods, irrigation types, soil amendments, growing techniques',
    buildPrompt: (topic, details) => {
      const parts = topic.split(' vs ');
      const a = (parts[0] || topic).trim();
      const b = (parts[1] || 'alternative approach').trim();
      return `Generate an image showing two watercolor botanical illustrations side by side — "${a}" on the left and "${b}" on the right — with small labeled arrows pointing to the key differences between them. Earth-tone palette, soft paper texture, "vs" text in the center.${details ? ' ' + details : ''}${INSTAGRAM_RATIO}`;
    },
  },

  'species-profile': {
    name: 'Species / Technique Deep-Dive',
    description: 'Vintage botanical plate-style illustration with anatomical detail.',
    style: 'vintage-botanical',
    suitableTopics: 'bamboo species, native trees, medicinal plants, pollinators, soil organisms, fungi, birds',
    buildPrompt: (topic, details) =>
      `Generate an image showing a vintage 18th-century botanical plate illustration of ${topic} with fine ink lines, numbered labels pointing to anatomical parts, a small lifecycle diagram in the corner, on an aged sepia paper background with an elegant serif title.${details ? ' ' + details : ''}${INSTAGRAM_RATIO}`,
  },

  'data-facts': {
    name: 'Facts & Figures Visual',
    description: 'Clean illustrated scene with bold statistics and icons.',
    style: 'minimal-modern',
    suitableTopics: 'bamboo facts, deforestation, carbon sequestration, water usage, biodiversity stats, farming economics',
    buildPrompt: (topic, details) =>
      `Generate an image showing large bold numbers and simple flat icons representing key facts about ${topic}, arranged on a clean cream background with forest green and gold accents, minimal modern illustration style with a small bar chart at the bottom.${details ? ' ' + details : ''}${INSTAGRAM_RATIO}`,
  },

  'seasonal-calendar': {
    name: 'Seasonal Activity Calendar',
    description: 'Four-season illustrated scene specific to Coorg climate.',
    style: 'watercolor-botanical',
    suitableTopics: 'food forest, coffee cultivation, bamboo management, vegetable garden, composting cycle, water management',
    buildPrompt: (topic, details) =>
      `Generate an image showing four seasonal scenes of ${topic} in Coorg, India arranged in quadrants — dry cool season, flowering season, monsoon rains (June–September), and harvest — each painted in watercolor with small botanical details and hand-lettered season names, earthy palette.${details ? ' ' + details : ''}${INSTAGRAM_RATIO}`,
  },
};

// ─── Resolve Playwright (lives in npx cache, not node_modules) ──
function resolvePlaywright() {
  const candidates = [
    path.join(__dirname, '..', 'node_modules', 'playwright'),
    ...(() => {
      try {
        const npxCache = path.join(process.env.HOME, '.npm', '_npx');
        if (!fs.existsSync(npxCache)) return [];
        return fs.readdirSync(npxCache).map(h =>
          path.join(npxCache, h, 'node_modules', 'playwright')
        );
      } catch { return []; }
    })(),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'index.js'))) return c;
  }
  throw new Error('playwright not found. Run: npx playwright install chromium');
}

const { chromium } = require(resolvePlaywright());

// ─── Config ──────────────────────────────────────────────────

const CHROMIUM_PATH = path.join(
  process.env.HOME,
  'Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64',
  'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
);

const PROFILE_DIR = path.join(process.env.HOME, 'Desktop/tms/.playwright-profile');
const GEMINI_URL  = 'https://gemini.google.com/app';

// ─── Argument Parsing ─────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    setup:          args.includes('--setup'),
    check:          args.includes('--check'),
    headed:         args.includes('--headed'),
    listTemplates:  args.includes('--list-templates'),
    prompt:         null,
    template:       null,
    topic:          null,
    details:        null,
    output:         null,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--prompt'   && args[i+1]) opts.prompt   = args[++i];
    if (args[i] === '--template' && args[i+1]) opts.template = args[++i];
    if (args[i] === '--topic'    && args[i+1]) opts.topic    = args[++i];
    if (args[i] === '--details'  && args[i+1]) opts.details  = args[++i];
    if (args[i] === '--output'   && args[i+1]) opts.output   = args[++i];
    if (args[i].startsWith('--prompt='))   opts.prompt   = args[i].slice(9);
    if (args[i].startsWith('--template=')) opts.template = args[i].slice(11);
    if (args[i].startsWith('--topic='))    opts.topic    = args[i].slice(8);
    if (args[i].startsWith('--output='))   opts.output   = args[i].slice(9);
  }
  return opts;
}

function listTemplatesCmd() {
  console.log('\n🌸 WildArc Bloom — Available Templates\n');
  Object.entries(TEMPLATES).forEach(([id, t]) => {
    console.log(`  ${id}`);
    console.log(`    Name:   ${t.name}`);
    console.log(`    Style:  ${t.style}`);
    console.log(`    For:    ${t.suitableTopics}`);
    console.log(`    About:  ${t.description}\n`);
  });
  console.log('Usage:');
  console.log('  node scripts/bloom-browser-gen.js --template <id> --topic "Your topic" --output path/to/img.jpg\n');
}

// ─── Browser Launch ───────────────────────────────────────────

async function launchBrowser(headless) {
  if (!fs.existsSync(CHROMIUM_PATH)) {
    throw new Error(
      `Chromium not found at: ${CHROMIUM_PATH}\n` +
      `Run: npx playwright install chromium`
    );
  }

  // Clear singleton lock if present (left by a previous crash)
  for (const f of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) {
    try { fs.unlinkSync(path.join(PROFILE_DIR, f)); } catch { /* ok */ }
  }

  fs.mkdirSync(PROFILE_DIR, { recursive: true });

  return chromium.launchPersistentContext(PROFILE_DIR, {
    headless,
    executablePath: CHROMIUM_PATH,
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: false,
  });
}

// ─── Login Check ──────────────────────────────────────────────

async function checkLogin(browser) {
  const page = await browser.newPage();
  await page.goto(GEMINI_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  const url = page.url();
  await page.close();
  return !url.includes('accounts.google.com') && !url.includes('/signin');
}

// ─── Setup Mode (headed, user logs in) ───────────────────────

async function runSetup() {
  console.log('\n🌸 WildArc Bloom — Browser Setup');
  console.log('─────────────────────────────────────────');
  console.log('A browser window will open.');
  console.log('Log in to Google when prompted, then close the window.');
  console.log('─────────────────────────────────────────\n');

  const browser = await launchBrowser(false); // headed
  const page = await browser.newPage();

  await page.goto(GEMINI_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (await checkLogin(browser)) {
    console.log('✅ Already logged in to Google! Profile saved.');
    console.log(`   Profile dir: ${PROFILE_DIR}`);
    await browser.close();
    return;
  }

  console.log('Waiting for you to log in and close the browser...');
  await browser.waitForEvent('close', { timeout: 300000 }).catch(() => {});
  console.log('\n✅ Setup complete! Profile saved at:');
  console.log(`   ${PROFILE_DIR}`);
}

// ─── Image Capture Helpers ────────────────────────────────────

/**
 * Try to extract image bytes via network interception.
 * Returns null if nothing captured within timeoutMs.
 */
function setupNetworkCapture(page) {
  let capturedBuffer = null;
  const seenUrls = new Set();
  const allImageUrls = []; // log all candidates for debugging

  page.on('response', async (response) => {
    if (capturedBuffer) return;
    const url = response.url();
    if (seenUrls.has(url)) return;
    seenUrls.add(url);

    const status = response.status();
    const contentType = response.headers()['content-type'] || '';
    if (status !== 200 || !contentType.startsWith('image/')) return;

    try {
      const buf = await response.body();
      if (!buf || buf.length < 80_000) return;

      // Reject known false positives: sprites/strips with extreme aspect ratios.
      // We detect this by checking the PNG/JPEG header dimensions inline.
      const dims = getImageDimensions(buf);
      const shortSide = dims ? Math.min(dims.w, dims.h) : Infinity;
      const longSide  = dims ? Math.max(dims.w, dims.h) : Infinity;
      const aspectRatio = longSide / (shortSide || 1);

      allImageUrls.push({ url: url.slice(0, 120), size: buf.length, dims });

      // Require: both sides >= 200px, aspect ratio <= 5:1
      if (shortSide < 200 || aspectRatio > 5) {
        console.log(`  [network] skip (${dims ? `${dims.w}x${dims.h}` : 'unknown dims'}, ${(buf.length/1024).toFixed(0)}KB): ${url.slice(0,80)}`);
        return;
      }

      capturedBuffer = buf;
      console.log(`  [network] ✓ Captured! ${dims.w}x${dims.h} ${(buf.length/1024).toFixed(0)}KB`);
      console.log(`  [network]   URL: ${url.slice(0, 100)}`);
    } catch { /* body already consumed */ }
  });

  return {
    get: () => capturedBuffer,
    debug: () => allImageUrls,
  };
}

/** Parse width/height from PNG or JPEG header bytes. Returns {w,h} or null. */
function getImageDimensions(buf) {
  try {
    // PNG: signature 8 bytes, then IHDR chunk: 4-len, 4-"IHDR", 4-width, 4-height
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      return { w, h };
    }
    // JPEG: scan for SOF0/SOF2 markers (0xFF 0xC0 or 0xFF 0xC2)
    for (let i = 0; i < Math.min(buf.length - 8, 65536); i++) {
      if (buf[i] === 0xFF && (buf[i+1] === 0xC0 || buf[i+1] === 0xC2)) {
        const h = buf.readUInt16BE(i + 5);
        const w = buf.readUInt16BE(i + 7);
        return { w, h };
      }
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * Try to find a large <img> element in the page DOM and screenshot it.
 * Returns a Buffer or null.
 */
async function captureViaElementScreenshot(page) {
  // Find the most recently added large image — likely the generated one
  const handle = await page.evaluateHandle(() => {
    const imgs = [...document.querySelectorAll('img[src], img[srcset]')];
    // Filter out tiny icons (< 200px in either dimension)
    const large = imgs.filter(img =>
      img.naturalWidth  >= 200 &&
      img.naturalHeight >= 200 &&
      !img.src.includes('avatar') &&
      !img.src.includes('favicon') &&
      !img.src.includes('logo') &&
      !img.src.includes('icon')
    );
    // Return the last large image (most recently added = the generated one)
    return large[large.length - 1] || null;
  });

  const el = handle.asElement();
  if (!el) { await handle.dispose(); return null; }

  try {
    const buf = await el.screenshot({ type: 'jpeg', quality: 92 });
    await handle.dispose();
    if (buf && buf.length > 30_000) {
      console.log(`  [dom] Captured image via element screenshot (${(buf.length/1024).toFixed(0)}KB)`);
      return buf;
    }
  } catch { await handle.dispose(); }

  return null;
}

/**
 * Poll every 3 seconds for up to timeoutMs looking for a generated image.
 * Tries network capture first, then DOM element screenshot.
 */
async function waitForImage(page, networkCapture, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  const startMs  = Date.now();
  let dot = 0;

  while (Date.now() < deadline) {
    await page.waitForTimeout(3000);
    dot++;
    const elapsed = Math.round((Date.now() - startMs) / 1000);
    if (dot % 4 === 0) {
      process.stdout.write(`  ⏳ still waiting (${elapsed}s elapsed)\n`);
    }

    // Approach 1 — network interception caught a valid-dimension image
    const netBuf = networkCapture.get();
    if (netBuf) return netBuf;

    // Approach 2 — element screenshot of a large img in the DOM
    const domBuf = await captureViaElementScreenshot(page);
    if (domBuf) return domBuf;
  }

  // Log all image URLs seen for debugging
  const seen = networkCapture.debug();
  if (seen.length) {
    console.log('\n  [debug] Images seen during session:');
    seen.forEach(({ url, size, dims }) =>
      console.log(`    ${dims ? `${dims.w}x${dims.h}` : '?x?'} ${(size/1024).toFixed(0)}KB  ${url}`)
    );
  }

  return null;
}

// ─── Image Generation ─────────────────────────────────────────

async function generateImage(prompt, outputPath, headed) {
  console.log('\n🌸 WildArc Bloom — Browser Generation');
  console.log('─────────────────────────────────────────');
  console.log(`Prompt: ${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}`);
  console.log(`Output: ${outputPath}`);
  if (headed) console.log('Mode:   headed (debug)');
  console.log('─────────────────────────────────────────\n');

  const browser = await launchBrowser(!headed); // headless unless --headed
  const page = await browser.newPage();

  try {
    // 1. Navigate
    console.log('Loading Gemini...');
    await page.goto(GEMINI_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    if (page.url().includes('accounts.google.com')) {
      throw new Error('Not logged in. Run: node scripts/bloom-browser-gen.js --setup');
    }

    console.log(`Page loaded: ${page.url().slice(0, 70)}`);

    // 2. Set up network interception BEFORE typing anything
    const networkCapture = setupNetworkCapture(page);

    // 3. Wait for the chat input
    console.log('Waiting for chat input...');
    const inputSelector = [
      'div[contenteditable="true"]',
      'rich-textarea div[contenteditable]',
      'textarea',
      'p[data-placeholder]',
    ].join(', ');

    await page.waitForSelector(inputSelector, { timeout: 25000 });
    await page.waitForTimeout(1500);

    // 4. Paste the full prompt at once via execCommand (avoids character-by-character
    //    typing which can cause Gemini to process partial text or split the prompt).
    const inputEl = page.locator('div[contenteditable="true"]').first();
    await inputEl.click({ timeout: 5000 });
    await page.waitForTimeout(500);

    // Clear any existing text, then insert the full prompt atomically
    await page.evaluate((text) => {
      const el = document.querySelector('div[contenteditable="true"]');
      if (!el) return;
      el.focus();
      // Select all existing content
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      // Replace with the full prompt in one operation
      document.execCommand('insertText', false, text);
    }, prompt);

    await page.waitForTimeout(600);

    // 5. Submit
    console.log('Sending prompt...');
    await page.keyboard.press('Enter');

    // 6. Poll for image (120s window)
    console.log('Waiting for image generation (up to 120s)...');
    const imageBuffer = await waitForImage(page, networkCapture, 120_000);

    if (!imageBuffer) {
      // Save a debug screenshot so we can see what Gemini rendered
      const debugPath = outputPath.replace(/\.[^.]+$/, '') + '-debug.png';
      fs.mkdirSync(path.dirname(debugPath), { recursive: true });
      await page.screenshot({ path: debugPath, fullPage: false });
      console.error(`\n  ⚠️  No image captured. Debug screenshot: ${debugPath}`);
      console.error('  Tip: run with --headed to watch in real time.\n');
      throw new Error('Image generation timed out — no image found in page after 120s.');
    }

    // 7. Save output
    const absOutput = path.isAbsolute(outputPath)
      ? outputPath
      : path.join(process.cwd(), outputPath);
    fs.mkdirSync(path.dirname(absOutput), { recursive: true });
    fs.writeFileSync(absOutput, imageBuffer);

    const sizeKB = (imageBuffer.length / 1024).toFixed(1);
    console.log(`\n✅ Image saved: ${absOutput} (${sizeKB}KB)`);
    return { path: absOutput, sizeBytes: imageBuffer.length };

  } finally {
    await browser.close();
  }
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  if (opts.setup) { await runSetup(); return; }

  if (opts.listTemplates) { listTemplatesCmd(); return; }

  if (opts.check) {
    const browser = await launchBrowser(true);
    const loggedIn = await checkLogin(browser);
    await browser.close();
    if (loggedIn) {
      console.log('✅ Logged in — ready for headless generation');
      process.exit(0);
    } else {
      console.log('❌ Not logged in — run: node scripts/bloom-browser-gen.js --setup');
      process.exit(1);
    }
    return;
  }

  if (!opts.output) {
    console.error('Usage:');
    console.error('  node scripts/bloom-browser-gen.js --list-templates');
    console.error('  node scripts/bloom-browser-gen.js --setup');
    console.error('  node scripts/bloom-browser-gen.js --check');
    console.error('  node scripts/bloom-browser-gen.js --template <id> --topic "Topic" --output path/img.jpg');
    console.error('  node scripts/bloom-browser-gen.js --prompt "Raw prompt" --output path/img.jpg');
    console.error('  Add --headed for a visible browser window (debug)');
    process.exit(1);
  }

  // Build prompt from template or use raw --prompt
  let finalPrompt;

  if (opts.template) {
    const tmpl = TEMPLATES[opts.template];
    if (!tmpl) {
      console.error(`❌ Unknown template "${opts.template}". Run --list-templates to see all.`);
      process.exit(1);
    }
    if (!opts.topic) {
      console.error(`❌ --template requires --topic "Your topic here"`);
      process.exit(1);
    }
    finalPrompt = tmpl.buildPrompt(opts.topic, opts.details || '');
    console.log(`Template: ${tmpl.name}`);
    console.log(`Topic:    ${opts.topic}`);
  } else if (opts.prompt) {
    // Raw prompt — ensure it starts with image-generation language and has ratio
    const p = opts.prompt.trim();
    const startsWithGenerate = /^generate\s+an?\s+image/i.test(p);
    const withGenerate = startsWithGenerate ? p : `Generate an image of: ${p}`;
    const hasRatio = /portrait|instagram|4.?5|1080/i.test(withGenerate);
    finalPrompt = hasRatio ? withGenerate : withGenerate + INSTAGRAM_RATIO;
  } else {
    console.error('❌ Provide either --template + --topic, or --prompt');
    process.exit(1);
  }

  await generateImage(finalPrompt, opts.output, opts.headed);
}

main().catch(err => {
  console.error(`\n❌ Error: ${err.message}\n`);
  process.exit(1);
});
