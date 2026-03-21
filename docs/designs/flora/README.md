# Flora Design Specifications

The Flora module is the heart of WildArc's companion planting and ecological intelligence. It shifts the focus from individual trees to the relationships *between* them and understory plants.

## 1. Guild Designer

**Goal:** Allow users to design and save "plant guilds" (groups of plants that benefit each other) that can be applied as templates to actual locations on the farm.

*(Note: Visual mockup generation temporarily unavailable)*

### Key UI Elements:
- **Layout**: Two-pane split view. Left side is a drag-and-drop canvas. Right side is a read-only details panel.
- **Canvas (Left Pane)**:
  - Central "Anchor" tree (e.g., Avocado, Mango).
  - Concentric circle zones representing canopy, understory, and ground cover.
  - Sidebar palette of "Support Plants" categorized by role: Nitrogen Fixers, Dynamic Accumulators, Pest Deterrents, Pollinator Attractors.
  - Users can drag plants from the palette into the concentric zones.
- **Analytics Panel (Right Pane)**:
  - **Synergy Score**: A large percentage ring (1-100%) indicating how well these plants work together based on the database.
  - **Alerts**: E.g., "Warning: Walnut (Juglone) inhibits tomato growth."
  - **Expected Yields**: Combined estimated yield metrics for the guild.
  - **Save Action**: "Save as Template" button.

---

## 2. Plant Database & Companion Scores

**Goal:** A read-only encyclopedia of plants with strict data structures focusing on ecological functions rather than just botanical trivia.

### Key UI Elements:
- **Layout**: Master-detail view. List of plants on the left, full profile on the right.
- **List View**: Thumbnail image, Common Name, Scientific Name, and pill badges for primary functions (e.g., `[N-Fixer]`, `[Edible]`).
- **Detail View**:
  - **Top**: High-quality hero image, Common & Scientific names.
  - **Grid**: 
    - Sunlight needs (Full, Part, Shade)
    - Water needs (High, Med, Low)
    - Root type (Tap, Fibrous)
    - Edible parts (Leaves, Fruit, Roots)
    - Medicinal uses
  - **Companion Matrix**: The most important section. A beautiful matrix showing "Loves", "Tolerates", and "Hates" relationships with other species.
  - **Action**: "Add to active Guild Draft" button.
