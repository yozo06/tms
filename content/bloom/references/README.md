# 🌸 WildArc Bloom — Reference Images

Style reference images that Gemini uses to maintain visual consistency.

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

When generating content, Bloom:
1. Checks if you specified a `--ref` image explicitly
2. If not, auto-discovers images in the style folder matching the template
3. Picks up to 2 random references from that folder
4. Sends them to Gemini alongside the text prompt

## Adding References

Drop images into the appropriate style folder. Supported: PNG, JPG, JPEG, WebP.

### Recommended Sources
- **Richard Belho (@richardbelho)** — Bamboo architecture, permaculture, documentary-style educational content from Nagaland
- **Your own successful Bloom generations** — feed good outputs back as references
- **Scientific illustration books** — Botanical plates, nature guides
- **Educational Instagram creators** — Infographic and carousel design references

## Tips

- Rotate references monthly to prevent Gemini mode collapse
- 2-3 references per style is the sweet spot
- Quality over quantity — one excellent reference beats five mediocre ones
- Seasonal themes: monsoon palette for June-September, harvest tones for October
