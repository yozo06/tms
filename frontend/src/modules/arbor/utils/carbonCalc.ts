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
  'grevillea robusta': 0.51,       // Silver Oak — most common in Coorg
  'coffea arabica': 0.60,          // Coffee — stem density
  'piper nigrum': 0.45,            // Black Pepper — vine, approximate
  'areca catechu': 0.35,           // Areca / Betelnut palm
  'tectona grandis': 0.65,         // Teak
  'eucalyptus globulus': 0.55,     // Eucalyptus
  'artocarpus heterophyllus': 0.53, // Jackfruit
  'mangifera indica': 0.58,        // Mango
  'azadirachta indica': 0.56,      // Neem
  'bambusa arundinacea': 0.40,     // Bamboo (culm density)
  'cocos nucifera': 0.30,          // Coconut palm
  'elettaria cardamomum': 0.42,    // Cardamom — rhizome-based, approximate
}

const DEFAULT_WOOD_DENSITY = 0.50  // IPCC default for tropical broadleaf trees

export function getWoodDensity(scientificName?: string | null): { density: number; isDefault: boolean } {
  if (!scientificName) return { density: DEFAULT_WOOD_DENSITY, isDefault: true }
  const key = scientificName.toLowerCase().trim()
  // Try exact match first, then partial genus match
  const exact = WOOD_DENSITY[key]
  if (exact !== undefined) return { density: exact, isDefault: false }
  const partial = Object.entries(WOOD_DENSITY).find(([k]) => key.includes(k.split(' ')[0]))
  return partial
    ? { density: partial[1], isDefault: false }
    : { density: DEFAULT_WOOD_DENSITY, isDefault: true }
}

export interface CarbonTreeInput {
  trunk_diameter_cm?: number | null
  height_m?: number | null
  approx_age_yrs?: number | null
  planting_date?: string | null
  species?: { scientific_name?: string | null; common_name?: string | null } | null
}

export function estimateCarbon(tree: CarbonTreeInput): CarbonEstimate {
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
    // Fallback: estimate using logarithmic approximation for tropical trees
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
  // Use age to approximate: young trees sequester faster
  const ageYrs = tree.approx_age_yrs
    ?? (tree.planting_date
      ? (Date.now() - new Date(tree.planting_date).getTime()) / (365.25 * 24 * 3600 * 1000)
      : 10)
  const growthFactor = ageYrs < 5 ? 0.15 : ageYrs < 15 ? 0.10 : 0.05
  const annualRateKg = co2eKg * growthFactor

  return { agbKg, carbonKg, co2eKg, co2eTonnes, annualRateKg, confidence, missingFields }
}

export function formatCO2(kg: number): string {
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g CO₂e`
  if (kg < 1000) return `${kg.toFixed(1)} kg CO₂e`
  return `${(kg / 1000).toFixed(2)} t CO₂e`
}

export interface MonitoringReportTree {
  tree_code: string
  custom_common_name?: string | null
  trunk_diameter_cm?: number | null
  height_m?: number | null
  approx_age_yrs?: number | null
  planting_date?: string | null
  coord_x?: number | null
  coord_y?: number | null
  land_zones?: { zone_name: string } | null
  species?: { common_name: string; scientific_name: string } | null
}

/** Generate a plain-text monitoring report for a tree — Verra VM0047 style */
export function generateMonitoringReport(
  tree: MonitoringReportTree,
  estimate: CarbonEstimate,
  projectName?: string
): string {
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
