/**
 * Centralized color constants for WildArc.
 *
 * Action colors are used on map markers, badges, and legends to indicate
 * the recommended action for each tree.  Keeping them in one file ensures
 * consistency across MapCanvas, MapView, and any future visualizations.
 *
 * Brand palette reference (docs/vision/03-brand-identity.md):
 *   Forest Green #2F6135 · Earth Brown #8B5E3C · Sky Blue #79BCE0
 *   Sunrise Gold #D8A419 · Stone Gray #5A5A5A · Off-White #F7F5EE
 */

/** Colors keyed by tree action type */
export const ACTION_COLORS: Record<string, string> = {
  cut: '#ef4444',      // Red — tree marked for removal
  trim: '#f59e0b',     // Amber — pruning / trimming needed
  keep: '#22c55e',     // Green — healthy, retain as-is
  monitor: '#3b82f6',  // Blue — watch & reassess
  treat: '#a855f7',    // Purple — pest or disease treatment
  pending: '#9ca3af',  // Gray — action not yet decided
  replant: '#f97316',  // Orange — replant after removal
}

/** Ordered subset used in the map legend */
export const LEGEND_ITEMS: { key: string; color: string }[] = [
  { key: 'cut', color: ACTION_COLORS.cut },
  { key: 'trim', color: ACTION_COLORS.trim },
  { key: 'keep', color: ACTION_COLORS.keep },
  { key: 'monitor', color: ACTION_COLORS.monitor },
  { key: 'pending', color: ACTION_COLORS.pending },
]

/** Canvas UI colors (grid, selection stroke, labels) */
export const CANVAS_COLORS = {
  gridStroke: '#e5e7eb',
  gridStrokeLight: '#f3f4f6',
  selectionStroke: '#1e293b',
  labelText: '#1e293b',
  existingTreeDot: '#e5e7eb',
  newTreeMarker: '#166534',  // Close to brand Forest Green #2F6135
} as const
