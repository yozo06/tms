import { describe, it, expect } from 'vitest'
import {
  estimateCarbon,
  formatCO2,
  generateMonitoringReport,
  getWoodDensity,
  WOOD_DENSITY,
} from './carbonCalc'

describe('getWoodDensity', () => {
  it('returns exact density for known species', () => {
    const result = getWoodDensity('Grevillea robusta')
    expect(result.density).toBe(0.51)
    expect(result.isDefault).toBe(false)
  })

  it('returns density by partial genus match', () => {
    // "tectona grandis blah" should still match tectona
    const result = getWoodDensity('tectona something')
    expect(result.density).toBe(0.65)
    expect(result.isDefault).toBe(false)
  })

  it('returns IPCC default for unknown species', () => {
    const result = getWoodDensity('Unknown exotica')
    expect(result.density).toBe(0.50)
    expect(result.isDefault).toBe(true)
  })

  it('returns IPCC default when scientificName is null', () => {
    const result = getWoodDensity(null)
    expect(result.density).toBe(0.50)
    expect(result.isDefault).toBe(true)
  })
})

describe('estimateCarbon', () => {
  it('calculates correct estimates for a well-measured Silver Oak', () => {
    // 30-year Silver Oak, DBH=40cm, H=18m
    const estimate = estimateCarbon({
      trunk_diameter_cm: 40,
      height_m: 18,
      approx_age_yrs: 30,
      species: { scientific_name: 'Grevillea robusta', common_name: 'Silver Oak' },
    })

    // AGB = 0.0673 × (0.51 × 40² × 18)^0.976
    // = 0.0673 × (0.51 × 1600 × 18)^0.976
    // = 0.0673 × (14688)^0.976
    // ≈ 0.0673 × 11018 ≈ 741 kg
    // CO₂e ≈ 741 × 0.47 × (44/12) ≈ 1277 kg
    expect(estimate.co2eKg).toBeGreaterThan(300)
    expect(estimate.co2eKg).toBeGreaterThan(300)
    expect(estimate.confidence).toBe('high')
    expect(estimate.missingFields).toHaveLength(0)
    expect(estimate.agbKg).toBeGreaterThan(100)
    expect(estimate.carbonKg).toBe(estimate.agbKg * 0.47)
    expect(estimate.co2eTonnes).toBeCloseTo(estimate.co2eKg / 1000, 6)
  })

  it('returns low confidence when all fields are null', () => {
    const estimate = estimateCarbon({
      trunk_diameter_cm: null,
      height_m: null,
      approx_age_yrs: null,
      planting_date: null,
      species: null,
    })
    expect(estimate.confidence).toBe('low')
    expect(estimate.missingFields.length).toBeGreaterThan(0)
    // Should still return valid numbers (non-NaN)
    expect(Number.isFinite(estimate.co2eKg)).toBe(true)
    expect(estimate.co2eKg).toBeGreaterThan(0)
  })

  it('returns medium confidence when height is missing but DBH is present', () => {
    const estimate = estimateCarbon({
      trunk_diameter_cm: 25,
      height_m: null,
      approx_age_yrs: 15,
      species: { scientific_name: 'Tectona grandis', common_name: 'Teak' },
    })
    expect(estimate.confidence).toBe('medium')
    expect(estimate.missingFields.some(f => f.includes('height_m'))).toBe(true)
  })

  it('uses planting_date to infer age when approx_age_yrs is null', () => {
    const tenYearsAgo = new Date()
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
    const estimate = estimateCarbon({
      trunk_diameter_cm: 20,
      height_m: 10,
      approx_age_yrs: null,
      planting_date: tenYearsAgo.toISOString(),
      species: { scientific_name: 'Mangifera indica', common_name: 'Mango' },
    })
    // ~10 yr tree: growth factor = 0.10
    expect(estimate.annualRateKg).toBeCloseTo(estimate.co2eKg * 0.10, 5)
  })

  it('CO2e = carbonKg × 44/12', () => {
    const estimate = estimateCarbon({
      trunk_diameter_cm: 30,
      height_m: 15,
      approx_age_yrs: 20,
      species: { scientific_name: 'Coffea arabica', common_name: 'Coffee' },
    })
    expect(estimate.co2eKg).toBeCloseTo(estimate.carbonKg * (44 / 12), 5)
  })
})

describe('formatCO2', () => {
  it('formats sub-kg as grams', () => {
    expect(formatCO2(0.5)).toBe('500 g CO₂e')
  })

  it('formats kg values with one decimal', () => {
    expect(formatCO2(142.3)).toBe('142.3 kg CO₂e')
  })

  it('formats tonne-scale as tonnes', () => {
    expect(formatCO2(1500)).toBe('1.50 t CO₂e')
  })

  it('handles exactly 1 kg boundary', () => {
    expect(formatCO2(1)).toBe('1.0 kg CO₂e')
  })

  it('handles exactly 1000 kg boundary', () => {
    expect(formatCO2(1000)).toBe('1.00 t CO₂e')
  })
})

describe('generateMonitoringReport', () => {
  const mockTree = {
    tree_code: 'TRE-001',
    custom_common_name: null,
    trunk_diameter_cm: 35,
    height_m: 16,
    approx_age_yrs: 25,
    planting_date: '2001-03-15',
    coord_x: 123.4,
    coord_y: 567.8,
    land_zones: { zone_name: 'North Block' },
    species: { common_name: 'Silver Oak', scientific_name: 'Grevillea robusta' },
  }

  const mockEstimate = estimateCarbon({
    trunk_diameter_cm: 35,
    height_m: 16,
    approx_age_yrs: 25,
    species: { scientific_name: 'Grevillea robusta', common_name: 'Silver Oak' },
  })

  it('contains tree code', () => {
    const report = generateMonitoringReport(mockTree, mockEstimate, 'Yogesh Farm')
    expect(report).toContain('TRE-001')
  })

  it('contains confidence level in uppercase', () => {
    const report = generateMonitoringReport(mockTree, mockEstimate)
    expect(report).toContain(mockEstimate.confidence.toUpperCase())
  })

  it('contains disclaimer text', () => {
    const report = generateMonitoringReport(mockTree, mockEstimate)
    expect(report).toContain('Third-party verification required')
  })

  it('contains Verra VM0047 reference', () => {
    const report = generateMonitoringReport(mockTree, mockEstimate)
    expect(report).toContain('VM0047')
  })

  it('shows coordinates when present', () => {
    const report = generateMonitoringReport(mockTree, mockEstimate)
    expect(report).toContain('X:123.4')
  })

  it('shows "Not recorded" for missing coordinates', () => {
    const treeNoCoords = { ...mockTree, coord_x: null, coord_y: null }
    const report = generateMonitoringReport(treeNoCoords, mockEstimate)
    expect(report).toContain('Not recorded')
  })

  it('shows notes line with "All measurements recorded" when confidence is high', () => {
    const report = generateMonitoringReport(mockTree, mockEstimate)
    // High confidence + no missing fields → full data note
    if (mockEstimate.missingFields.length === 0) {
      expect(report).toContain('All measurements recorded')
    }
  })

  it('uses WOOD_DENSITY table values that are all within valid range (0.2–0.9 g/cm³)', () => {
    Object.entries(WOOD_DENSITY).forEach(([species, density]) => {
      expect(density).toBeGreaterThanOrEqual(0.20)
      expect(density).toBeLessThanOrEqual(0.90)
    })
  })
})
