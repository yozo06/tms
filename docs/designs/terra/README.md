# Terra Design Specifications

The Terra module focuses on the non-living elements of the ecosystem: soil health, water topography, and weather patterns.

## 1. Soil Health Dashboard

**Goal:** Track the improvement of soil over time, moving from degraded dirt to rich, organic matter.

*(Note: Visual mockup generation temporarily unavailable)*

### Key UI Elements:
- **Layout**: Dashboard with widget grids.
- **Top Metrics**: 
  - Current average Organic Matter %
  - Average pH
  - NPK index
- **Visualizations**:
  - **Radar Chart ("Spider Web")**: Compares the ideal soil composition for a specific zone against the latest test results. This is a highly visual way to see deficiencies instantly.
  - **Timeline Area Chart**: Shows Organic Matter % increasing over the years as permaculture practices take effect.
- **Data Table**: History of soil test results logged by zone and date.
- **Action**: "Log Soil Test" button opening a complex form for N, P, K, pH, OM%, and visual assessments.

---

## 2. Water & Topography View

**Goal:** Visualize water flow, swales, ponds, and elevation across the farm to plan earthworks.

### Key UI Elements:
- **Map View Mode**: A toggle on the main Arbor map that switches to "Terra/Water" mode.
- **Layers**: 
  - Topographic contour lines.
  - Hand-drawn or GPS-tracked lines representing "Swales" (water-harvesting ditches).
  - Polygons representing "Ponds" or water catchment areas.
- **Overlays**: Heatmap of relative soil moisture if sensor data is available.
- **Interaction**: Clicking a swale shows its length, depth, and estimated water holding capacity.
