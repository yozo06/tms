# WildArc Content Pipeline — Reference Images

This folder stores style reference images that Gemini uses to maintain visual consistency across generated content.

## Folder Structure

```
references/
├── watercolor-botanical/    ← Soft watercolor style (bamboo infographic style)
├── comic-panel/             ← Comic book / illustrated story style
├── minimal-modern/          ← Clean, flat design with icons
├── vintage-botanical/       ← Scientific illustration style
├── hand-drawn-sketch/       ← Notebook/sketch style
└── unsorted/                ← Drop new references here — sort later
```

## How It Works

When you generate content, the pipeline:
1. Checks if you specified a `--ref` image explicitly
2. If not, looks for images in the style folder matching the template's `style` preset
3. Picks up to 2 random references from that folder
4. Sends them to Gemini alongside the text prompt

## Adding References

1. **Drop images** into the appropriate style folder (or `unsorted/`)
2. **Supported formats**: PNG, JPG, JPEG, WebP
3. **Recommended size**: At least 1024px on longest side
4. **Naming**: Use descriptive names like `bamboo-architecture-watercolor.png`

### Good Reference Sources

- **Richard Belho (@richardbelho)** — Bamboo architecture, permaculture visuals
- **Your own generated images** that turned out well — feed them back as references!
- **Scientific illustration books** — Botanical plates, nature guides
- **Infographic designers** — Educational Instagram content creators

## Tips

- **Rotate references monthly** to prevent Gemini from developing "mode collapse" (same-looking outputs)
- **2-3 references per style** is the sweet spot — too many can confuse the model
- **Quality over quantity** — one excellent reference beats five mediocre ones
- **Seasonal themes**: Consider having monsoon-palette references for June-September, harvest warm-tones for October
