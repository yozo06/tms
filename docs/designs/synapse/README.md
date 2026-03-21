# Synapse Design Specifications

The Synapse module is the intelligence layer. It aggregates data from Arbor, Flora, and Terra to uncover insights, prove the model, and share knowledge.

## 1. Ecosystem Mind Map

**Goal:** Visually demonstrate the complex, interconnected web of relationships on the farm to visitors, students, and researchers.

*(Note: Visual mockup generation temporarily unavailable)*

### Key UI Elements:
- **Canvas**: A full-screen, interactive force-directed graph (like a complex network or neural net).
- **Nodes**: Circles representing entities (Trees, Specific Plants, Fungi, Soil Types, Animal species observed). Nodes are color-coded by type.
- **Edges (Lines)**: Connecting lines representing relationships.
  - *Example 1*: A thick green line between "Pigeon Pea" and "Soil Zone A" labeled "Fixed Nitrogen".
  - *Example 2*: A blue line from "Pond 1" to "Banana Guild" labeled "Irrigates".
- **Interaction**:
  - Hovering over a node dims the rest of the graph and highlights only its 1st-degree connections.
  - Clicking a node opens a side panel with hard data supporting that relationship.
- **Aesthetic**: Dark mode by default. Glowing neon colors for nodes and edges to make the ecosystem feel "alive" and highly technical.

---

## 2. Global Analytics & Academic Export

**Goal:** Allow researchers to query the aggregated, anonymized data across all projects using WildArc to find macro-trends in permaculture.

### Key UI Elements:
- **Query Builder**: A visual SQL-like interface. 
  - E.g., "Select [Yields] where [Tree = Mango] and [Companion = Comfrey] and [Climate = Tropical]".
- **Results View**: Scatter plots and bar charts comparing yields of trees with vs. without specific companions.
- **Export Toolbar**: Buttons for strictly formatted data exports: "Download CSV", "Export Darwin Core Archive (DwC-A)", "Copy API Endpoint".
