# 🌱 Carbon Profile — Feature Design Spec

> **Arbor V2 Feature · Backlog: M-07 · Target Sprint: S4**
>
> Authored by WildArc Daily Steward — 2026-03-26

---

## Overview

Add a **Carbon Profile section** to TreeDetail that estimates each tree's carbon sequestration contribution using published allometric equations, and generates a downloadable monitoring report suitable for Verra VM0047 pre-qualification.

**Why this matters:** Small agroforestry landowners in Coorg cannot access carbon markets because they lack verified data trails. WildArc already captures everything needed — no new database migration required. This feature makes that data useful.

---

## Good News: No Migration Needed

The `Tree` type already carries all required fields:

| Field | Column | Current Use |
|-------|--------|-------------|
| `trunk_diameter_cm` | `trees.trunk_diameter_cm` | Displayed in TreeEdit |
| `height_m` | `trees.height_m` | Displayed in TreeDetail metrics grid |
| `approx_age_yrs` | `trees.approx_age_yrs` | Displayed in TreeDetail metrics grid |
| `planting_date` | `trees.planting_date` | Available on tree object |
| `species` | join: `species.common_name`, `scientific_name` | Displayed in TreeDetail header |

Backend already selects all of these in `src/routes/trees.ts`. Zero schema work required.

---

## File to Create

### `frontend/src/modules/arbor/utils/carbonCalc.ts`

Pure calculation utility — no React, no side effects, fully testable.

```typescript
/**
 * Carbon sequestration estimator for WildArc Arbor module.
 *
 * Equations:
 *   - Above-Ground Biomass (AGB): Chave et al. 2014 pantropical equation
 *     AGB = 0.0673 × (ρ × D² × H) ^ 0.976
 *     where ρ = wood density (g/cm³), D = DBH (cm), H = height (m)
 *
 *   - Carbon fraction: IPCC default = 0.47 of AGB dry mass
 *
 *   - CO₂ equivalent: Carbon × 44/12 (molecular weight ratio CO₂/C)
 *
 * Wood density reference: ICFRE Species-wise Biomass Equations 2020,
 * Global Wood Density Database (Zanne et al. 2009)
 */

export interface CarbonEstimate {
  agbKg: number              // Above-ground biomass in kg
  carbonKg: number           // Carbon stored in kg
  co2eKg: number             // CO₂ equivalent absorbed in kg
  co2eTonnes: number         // CO₂ equivalent in tonnes (for credit discussions)
  annualRateKg: number       // Estimated annual CO₂ absorption in kg
  confidence: 'high' | 'medium' | 'low'  // Based on data completeness
  missingFields: string[]    // Which fields are estimated/missing
}

// Wood densities (g/cm³) for common Coorg species
// Source: ICFRE (2020), Zanne et al. (2009) Global Wood Density Database
export const WOOD_DENSITY: Record<string, number> = {
  // Scientific name key (lowercase) → wood density
  'grevillea robusta': 0.51,      // Silver Oak — most common in Coorg
  'coffea arabica': 0.60,         // Coffee — stem density
  'piper nigrum': 0.45,           // Black Pepper — vine, approximate
  'areca catechu': 0.35,          // Areca / Betelnut palm
  'tectona grandis': 0.65,        // Teak
  'eucalyptus globulus': 0.55,    // Eucalyptus
  'artocarpus heterophyllus': 0.53, // Jackfruit
  'mangifera indica': 0.58,       // Mango
  'azadirachta indica': 0.56,     // Neem
  'bambusa arundinacea': 0.40,    // Bamboo (culm density)
  'cocos nucifera': 0.30,         // Coconut palm
  'elettaria cardamomum': 0.42,   // Cardamom — rhizome-based, approximate
}

const DEFAULT_WOOD_DENSITY = 0.50  // IPCC default for tropical broadleaf trees

export function getWoodDensity(scientificName?: string): { density: number; isDefault: boolean } {
  if (!scientificName) return { density: DEFAULT_WOOD_DENSITY, isDefault: true }
  const key = scientificName.toLowerCase().trim()
  // Try exact match first, then partial
  const density = WOOD_DENSITY[key]
    ?? Object.entries(WOOD_DENSITY).find(([k]) => key.includes(k.split(' ')[0]))?.[1]
  return density
    ? { density, isDefault: false }
    : { density: DEFAULT_WOOD_DENSITY, isDefault: true }
}

export function estimateCarbon(tree: {
  trunk_diameter_cm?: number | null
  height_m?: number | null
  approx_age_yrs?: number | null
  planting_date?: string | null
  species?: { scientific_name?: string; common_name?: string } | null
}): CarbonEstimate {
  const missingFields: string[] = []
  let confidence: CarbonEstimate['confidence'] = 'high'

  // --- DBH ---
  let dbh = tree.trunk_diameter_cm
  if (!dbh) {
    // Fallback: estimate from age using average tropical growth rate ~2.5 cm/yr
    dbh = (tree.approx_age_yrs ?? 5) * 2.5
    missingFields.push('trunk_diameter_cm (estimated from age)')
    confidence = 'low'
  }

  // --- Height ---
  let height = tree.height_m
  if (!height) {
    // Fallback: estimate using Lorey's height approximation for tropical trees
    // H ≈ 27.3 × (1 - e^(-0.0281 × D^0.654)) — simplified
    height = Math.min(25, 3.5 * Math.log(dbh + 1))
    missingFields.push('height_m (estimated from DBH)')
    if (confidence === 'high') confidence = 'medium'
  }

  // --- Wood density ---
  const { density: rho, isDefault } = getWoodDensity(tree.species?.scientific_name)
  if (isDefault) {
    missingFields.push('wood density (using IPCC default 0.50 g/cm³)')
    if (confidence === 'high') confidence = 'medium'
  }

  // --- AGB: Chave et al. 2014 ---
  // AGB = 0.0673 × (ρ × D² × H) ^ 0.976
  const agbKg = 0.0673 * Math.pow(rho * dbh * dbh * height, 0.976)

  // --- Carbon stock (IPCC default: 47% of AGB is carbon) ---
  const carbonKg = agbKg * 0.47

  // --- CO₂ equivalent (C × 44/12) ---
  const co2eKg = carbonKg * (44 / 12)
  const co2eTonnes = co2eKg / 1000

  // --- Annual sequestration rate ---
  // Using age to estimate: current stock / age gives average annual accumulation
  // Adjust: young trees sequester faster; use a growth factor curve
  const ageYrs = tree.approx_age_yrs
    ?? (tree.planting_date ? (Date.now() - new Date(tree.planting_date).getTime()) / (365.25 * 24 * 3600 * 1000) : 10)
  // Annual rate: approximate current-year increment ≈ 5% of total stock for mature trees
  const growthFactor = ageYrs < 5 ? 0.15 : ageYrs < 15 ? 0.10 : 0.05
  const annualRateKg = co2eKg * growthFactor

  return { agbKg, carbonKg, co2eKg, co2eTonnes, annualRateKg, confidence, missingFields }
}

export function formatCO2(kg: number): string {
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g CO₂e`
  if (kg < 1000) return `${kg.toFixed(1)} kg CO₂e`
  return `${(kg / 1000).toFixed(2)} t CO₂e`
}

/** Generate a plain-text monitoring report for a tree — Verra VM0047 style */
export function generateMonitoringReport(tree: {
  tree_code: string
  custom_common_name?: string
  trunk_diameter_cm?: number | null
  height_m?: number | null
  approx_age_yrs?: number | null
  planting_date?: string | null
  coord_x?: number | null
  coord_y?: number | null
  land_zones?: { zone_name: string } | null
  species?: { common_name: string; scientific_name: string } | null
}, estimate: CarbonEstimate, projectName?: string): string {
  const date = new Date().toISOString().split('T')[0]
  const lines = [
    '=== WildArc Carbon Monitoring Report ===',
    `Generated: ${date}`,
    `Standard: Verra VM0047 (Agroforestry) — Pre-qualification data`,
    '',
    '--- TREE RECORD ---',
    `Tree Code:       ${tree.tree_code}`,
    `Common Name:     ${tree.custom_common_name || tree.species?.common_name || 'Unknown'}`,
    `Scientific Name: ${tree.species?.scientific_name || 'Unknown'}`,
    `Land Zone:       ${tree.land_zones?.zone_name || 'Unassigned'}`,
    `Project:         ${projectName || 'WildArc Farm'}`,
    '',
    '--- MEASUREMENTS ---',
    `DBH (cm):        ${tree.trunk_diameter_cm ?? 'Not recorded'}`,
    `Height (m):      ${tree.height_m ?? 'Not recorded'}`,
    `Age (years):     ${tree.approx_age_yrs ?? 'Not recorded'}`,
    `Planting Date:   ${tree.planting_date ?? 'Not recorded'}`,
    `Map Coordinates: ${tree.coord_x != null ? `X:${tree.coord_x} Y:${tree.coord_y}` : 'Not recorded'}`,
    '',
    '--- CARBON ESTIMATES ---',
    `Above-Ground Biomass:    ${estimate.agbKg.toFixed(2)} kg (dry)`,
    `Carbon Stored:           ${estimate.carbonKg.toFixed(2)} kg C`,
    `CO₂ Equivalent:          ${estimate.co2eKg.toFixed(2)} kg CO₂e  (${estimate.co2eTonnes.toFixed(4)} tonnes)`,
    `Annual Sequestration:    ~${estimate.annualRateKg.toFixed(2)} kg CO₂e / year`,
    `Data Confidence:         ${estimate.confidence.toUpperCase()}`,
    '',
    '--- METHODOLOGY ---',
    'AGB Equation: Chave et al. 2014 pantropical (AGB = 0.0673 × (ρ·D²·H)^0.976)',
    'Carbon fraction: 0.47 (IPCC Tier 1 default)',
    'CO₂ conversion: C × 44/12',
    'Wood density source: ICFRE (2020) / Zanne et al. (2009)',
    '',
    estimate.missingFields.length > 0
      ? `NOTES: ${estimate.missingFields.join('; ')}`
      : 'NOTES: All measurements recorded — full data confidence.',
    '',
    '--- DISCLAIMER ---',
    'This report is for informational and pre-qualification purposes only.',
    'Third-party verification required for official carbon credit issuance.',
    '=========================================',
  ]
  return lines.join('\n')
}
```

---

## Component: Carbon Profile Section in TreeDetail

### Where to insert

In `frontend/src/modules/arbor/pages/TreeDetail.tsx`, add the Carbon Profile section **after the Health & Metrics Grid** (after line ~151) and **before the Action Controls** block.

### UI Structure

```
┌─────────────────────────────────────────────┐
│  🌱  CARBON PROFILE                         │
│  ─────────────────────────────────────────  │
│                                             │
│  [ 142 kg CO₂e ]   [ ~14 kg / yr ]         │
│   Total absorbed     Annual rate            │
│                                             │
│  Above-ground biomass: 143.2 kg (dry)       │
│  Carbon stored: 67.3 kg C                   │
│                                             │
│  ● Data confidence: MEDIUM                  │
│    ⚠ height estimated from DBH              │
│                                             │
│  [ ↓ Download Monitoring Report ]           │
└─────────────────────────────────────────────┘
```

### Confidence color coding

| Confidence | Color | Meaning |
|------------|-------|---------|
| `high` | `text-forest-600` / green badge | All 3 fields recorded (DBH, height, species) |
| `medium` | `text-amber-600` / amber badge | 1–2 fields estimated |
| `low` | `text-gray-400` / gray badge | DBH missing — using age approximation |

### Empty state

If `approx_age_yrs`, `trunk_diameter_cm`, and `height_m` are all null, show a prompt card:

> "Add height and trunk diameter in Edit Tree to unlock carbon estimates."

Link to Edit Tree page.

---

## Download Report Behavior

Use a client-side blob download (no backend needed):

```typescript
const blob = new Blob([reportText], { type: 'text/plain' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `wildarc-carbon-${tree.tree_code}-${date}.txt`
a.click()
URL.revokeObjectURL(url)
```

---

## New Lucide Icon to Import

Add `Leaf` from `lucide-react` for the section header icon. Already available in the installed version.

---

## Suggested Data Entry Prompt (in TreeEdit)

The Planner should also verify that `trunk_diameter_cm` has a proper input field in TreeEdit. If it exists but is hidden, surface it. If missing, add a numeric input with placeholder "e.g. 35" and label "Trunk diameter at chest height (cm)".

---

## Test Cases for `carbonCalc.ts`

Add to `frontend/src/modules/arbor/utils/carbonCalc.test.ts`:

```typescript
// 1. Silver Oak, 30 yr, DBH=40cm, H=18m → expect ~300–500 kg CO₂e
// 2. All nulls → returns low confidence estimate with fallbacks
// 3. formatCO2(0.5) → '500 g CO₂e'
// 4. formatCO2(1500) → '1.50 t CO₂e'
// 5. generateMonitoringReport → contains tree_code, confidence, disclaimer
```

---

## Definition of Done (for Planner)

- [ ] `carbonCalc.ts` created with `estimateCarbon`, `getWoodDensity`, `formatCO2`, `generateMonitoringReport`
- [ ] Carbon Profile section renders in TreeDetail with correct values
- [ ] Download button generates `.txt` report with correct format
- [ ] Empty state shown when no measurements exist
- [ ] `trunk_diameter_cm` input verified/added in TreeEdit
- [ ] `tsc --noEmit` still 0 errors
- [ ] At least 3 unit tests in `carbonCalc.test.ts`

---

*Design spec authored by WildArc Daily Steward — 2026-03-26*
*Motivated by Thursday Problem Journal entry: carbon credit access for small Coorg agroforestry farms*
