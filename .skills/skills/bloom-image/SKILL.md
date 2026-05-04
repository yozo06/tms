---
name: bloom-image
description: "Generate a WildArc Bloom educational image using Gemini (free, via browser automation). Triggers when user asks to generate, create, or make a Bloom image, Instagram post, educational illustration, or content for WildArc. Guides template selection, plans the scene, and builds the right prompt automatically."
---

# WildArc Bloom Image Generator Skill

## What this skill does

Generates a free Instagram-portrait (4:5) educational image for WildArc using Gemini on gemini.google.com via Playwright browser automation. No API billing needed.

---

## Step 1 — Ask the right clarifying questions

Use **AskUserQuestion** to gather the essentials before running anything. Ask only what you don't already know from context.

### Required info
1. **Topic** — what is the image about? (e.g. "monsoon season in a Coorg food forest", "bamboo root systems", "composting cycle")
2. **Format / template** — present the 7 options clearly and let the user pick:

```
1. infographic-educational — Watercolor botanical scene with labeled diagrams and key facts (classic WildArc look)
2. carousel-tutorial       — Eye-catching cover slide for a step-by-step tutorial carousel
3. comic-learning          — Illustrated story panel: nature scene with speech bubbles and callout annotations
4. infographic-comparison  — Two things illustrated side-by-side with labeled differences
5. species-profile         — Vintage 18th-century botanical plate style, anatomical detail
6. data-facts              — Bold numbers + flat icons on clean minimal background
7. seasonal-calendar       — Four-season watercolor quadrant, Coorg climate-specific
```

3. **Audience** — beginners / curious followers / farmers / researchers? This shapes vocabulary in callouts.
4. **Key focus elements** — what must the image communicate? (e.g. "show all 3 canopy layers", "emphasise water harvesting", "show wildlife")
5. **Visual style tone** — comic/illustrated, scientific, watercolor, dramatic, warm/golden, etc.
6. **Output filename** — suggest a sensible default like `content/bloom/generated/YYYY-MM/TOPIC-TEMPLATE.jpg`; confirm if they want something specific.

**Do not ask about technical settings** (headless, timeout, profile) — those are handled automatically.

---

## Step 2 — Plan the scene BEFORE writing the prompt

This step is **mandatory** for any nature/ecosystem/permaculture topic. Good images come from a well-planned visual scene, not from a description of what should be communicated.

Think through and write out your scene plan (you can share it with the user briefly):

### Scene planning checklist

**For nature/forest/farm ecosystem topics:**
- What does the environment LOOK LIKE at this moment? (season, weather, light quality, colours)
- What are the visible layers? (top canopy → mid layer → ground layer → soil cross-section)
- What specific plants, animals, or elements should appear at each layer?
- What is actively HAPPENING in the scene? (rain filling swales, blossoms on coffee, mushrooms sprouting)
- What 4–5 callout annotation boxes will carry the actual learning?
- Is a human figure needed? **Only include a human if hands or tools add context that the landscape alone cannot show.** Avoid a single person "standing and pointing" — the forest is the hero.

**For tutorial/process topics:**
- What is the sequence of steps shown?
- What tools, materials, or organisms are involved?
- What does success look like visually?

**For species/botanical topics:**
- What life stage or angle is most informative?
- What parts need labeling (roots, leaves, flowers, seeds)?
- What ecological relationships should be visible?

### Example scene plan (Monsoon season in a food forest)
> Scene: heavy monsoon rain, blue-grey dramatic sky. Swales brimming, flowing into a pond. Silver oak full canopy breaking rainfall. Mushrooms at tree bases. Ferns and vines in explosive growth. Soil cross-section inset shows dark rich earth. Callouts: swale stores 6 months of water / canopy prevents erosion / mushrooms = healthy soil biology / cardamom loves 90% humidity / mulch now to protect topsoil. No human figure — the forest tells the story.

---

## Step 3 — Build and run the command

Use **Desktop Commander** (`mcp__Desktop_Commander__start_process`) — NOT the sandbox Bash tool (no network access there).

```bash
cd /Users/yogesh.zope/Desktop/tms && node scripts/bloom-browser-gen.js \
  --template <TEMPLATE_ID> \
  --topic "<TOPIC>" \
  --details "<DETAILED SCENE DESCRIPTION FROM PLAN>" \
  --output <OUTPUT_PATH> \
  2>&1
```

Start with `timeout_ms: 15000` just to get the PID and confirm it's running.

### Writing the --details argument from your scene plan

The `--details` arg is where the scene plan becomes a prompt. Key rules:

1. **Describe visual layers explicitly** — name canopy, mid layer, ground layer, soil if relevant.
2. **Name specific plants** — "silver oak", "coffee bushes with red cherries", "cardamom in deep shade", "pepper vines on trunks". Generic "tropical plants" produces generic images.
3. **Describe what is HAPPENING** — "swales overflowing into a pond", "white star blossoms covering every coffee branch", "mushrooms sprouting at base of trunks". Static descriptions produce flat images.
4. **Write callout boxes directly in details** — `callout boxes: 'Silver oak leaf drop = free mulch', 'Coffee cherry harvest: Nov to Jan'`. These show up as annotations in the generated image.
5. **Specify no human if not needed** — literally write "No human figure needed — the forest tells the story" in the details.
6. **State the mood/palette** — "warm golden harvest tones", "blue-grey monsoon drama", "soft peachy morning light". This shapes the entire feel.

### Example of a strong --details string
```
multi-layer food forest cross-section in monsoon. Heavy diagonal rain, blue-grey sky. 
Top canopy: full silver oak canopy breaking rainfall into drips. Mid layer: vines and 
coffee shooting new growth. Ground layer: ferns, cardamom lush and tall. Swale in 
foreground brimming with collected rainwater overflowing into earthen pond. 
Mushrooms sprouting at tree bases. Soil cross-section inset shows dark rich earth 
with worms. No human figure needed. Callout boxes: 'Swale slow, spread and sink 
rainwater into aquifer', 'Silver oak canopy = zero soil erosion', 
'Mushrooms = healthy soil biology', 'Cardamom loves 90% humidity — peak growth now', 
'Mulch now! Bare soil erodes in 10 minutes of rain'. Deep greens, blue-grey monsoon atmosphere.
```

---

## Step 4 — Wait for completion (CRITICAL — do not skip)

The script takes **60–120 seconds**. Use `read_process_output` with `timeout_ms: 60000` and keep polling until you see one of:

- `✅ Image saved: /path/to/file.jpg (XKB)` → success
- `❌ Error:` → failure, see troubleshooting below
- `✅ Process completed with exit code 0` → also success

**Poll pattern:**
```
read_process_output(pid, timeout_ms=60000)  → repeat until done
```

Do NOT declare success or failure until you see the exit code line.

---

## Step 5 — Verify visually (MANDATORY)

After generation, always verify the output:

```bash
# 1. Check file exists and dimensions
file /path/to/output.jpg
# Should show: JPEG image data, NNNxNNN — confirm height > width (portrait)
```

Then **present the image** using `mcp__cowork__present_files` so you can see what was actually generated. Check:
- Are the canopy layers visible and distinct?
- Are the callout boxes present with legible text?
- Does the scene match the plan (correct season mood, right plants)?
- Is there an unnecessary human figure dominating the composition?

If any of the above fail, note what's wrong and regenerate with adjusted details before presenting to the user.

---

## Step 6 — Handle failures

### Gemini generated text instead of an image
The prompt triggered a text response instead of generating an image.
- Check the `-debug.png` file saved alongside the output path.
- Re-run with `--headed` flag to watch it live.
- All template prompts start with "Generate an image showing..." — verify this is present.

### SingletonLock error
```bash
rm -f /Users/yogesh.zope/Desktop/tms/.playwright-profile/SingletonLock
```
Then re-run. This is auto-cleared by the script on launch but can persist if a previous run was force-killed.

### Login expired
```bash
cd /Users/yogesh.zope/Desktop/tms && node scripts/bloom-browser-gen.js --setup
```
A headed browser window will open. Log in to Google, then close it. Profile is saved for future headless runs.

### Network capture found 0 images
Run with `--headed` to see what Gemini actually shows. The network filter requires:
- Both dimensions ≥ 200px
- Aspect ratio ≤ 5:1
- File size ≥ 80KB

---

## Key facts

| Item | Value |
|---|---|
| Script | `scripts/bloom-browser-gen.js` |
| Login profile | `.playwright-profile/` (persistent) |
| Output dir | `content/bloom/generated/YYYY-MM/` |
| List templates | `node scripts/bloom-browser-gen.js --list-templates` |
| Check login | `node scripts/bloom-browser-gen.js --check` |
| Gemini CDN | `lh3.googleusercontent.com` |
| Typical time | 60–120s per image |
| Typical output | 250–380KB, portrait ~825×1024 |

---

## Prompt engineering rules (built into script)

1. **Always "Generate an image showing..."** — not "create a poster/infographic". Gemini writes text for design documents; it generates images for scene descriptions.
2. **The forest/nature is the hero** — avoid a single human character as the primary subject. If humans appear, show hands, tools, or a partial figure alongside the landscape — not a person standing in front of it explaining.
3. **Describe what you'd SEE in a painting** — "watercolor cross-section of a food forest in monsoon with swales overflowing" not "educational image about monsoon water management".
4. **Name specific organisms and layers** — "silver oak", "cardamom in deep shade", "pepper vines on trunks" produces far better output than "tropical plants".
5. **Callout boxes in the details arg** carry the learning — write them explicitly: `callout boxes: 'text here', 'more text'`.
6. **Portrait orientation** appended automatically: `"Generate in portrait orientation (4:5 ratio) suitable for Instagram."`
7. **Full prompt inserted at once** via `document.execCommand('insertText')` — never typed character-by-character.

---

## Lessons learned (from WildArc carousel production)

**What produces rich educational images:**
- Multi-layer cross-section composition (canopy → mid → ground → soil inset)
- Season-specific visual cues (rain streaks, blossoms, dry cracked soil, golden harvest light)
- Named specific species at each layer
- Callout boxes written directly into the details string
- Mood/palette stated explicitly at the end of details

**What produces weak images:**
- Single human figure "standing and explaining" with speech bubble — dominates composition, blocks the forest
- Generic plant descriptions ("tropical trees", "lush vegetation")
- No explicit callout text in the prompt — Gemini may not add annotations at all
- Prompt describes WHAT TO COMMUNICATE rather than WHAT TO SHOW VISUALLY
- Asking for "a poster" or "an infographic" — triggers text response instead of image generation

**Carousel production pattern:**
When generating a carousel series (multiple slides on related topics), plan all slides together before generating any:
1. Write out the scene plan for every slide first
2. Ensure visual variety across slides (different seasons = different palettes, weather, plant states)
3. Generate sequentially (one at a time — same Gemini session reuse)
4. Verify each slide visually before moving to the next
