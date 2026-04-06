-- Migration 008: Update zone_summary view to include project_id
--
-- Context:
--   The zone_summary view was created during initial Arbor V1 setup and does
--   not include project_id. This prevents the dashboard from filtering zones
--   by project in a multi-tenant setup (see H-16 TODO in dashboard.ts).
--
-- What this does:
--   1. Drops and recreates zone_summary with project_id included
--   2. The view now exposes project_id from land_zones, allowing
--      `.eq('project_id', ...)` filtering in the dashboard route
--
-- Prerequisites:
--   - Migration 004 (project_id NOT NULL on land_zones)
--
-- Run in: Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Reversible: Yes (see ROLLBACK section at bottom)

-- ============================================================================
-- STEP 1: Check current view definition (informational — run manually first)
-- ============================================================================
-- Run this first to see the current view definition:
-- SELECT pg_get_viewdef('public.zone_summary', true);

-- ============================================================================
-- STEP 2: Recreate zone_summary view with project_id
-- ============================================================================
-- Using CREATE OR REPLACE where possible, but if column list changes
-- we need DROP + CREATE.

DROP VIEW IF EXISTS public.zone_summary;

CREATE VIEW public.zone_summary AS
SELECT
  lz.id,
  lz.zone_code,
  lz.zone_name,
  lz.project_id,
  COUNT(t.id)::int AS total_trees,
  COUNT(t.id) FILTER (WHERE t.status = 'completed')::int AS completed
FROM public.land_zones lz
LEFT JOIN public.trees t ON t.zone_id = lz.id
GROUP BY lz.id, lz.zone_code, lz.zone_name, lz.project_id;

COMMENT ON VIEW public.zone_summary IS
  'Aggregated zone statistics with project_id for multi-tenant filtering. '
  'Updated by migration 008 to include project_id.';

-- ============================================================================
-- STEP 3: Grant permissions (match existing grants)
-- ============================================================================
GRANT SELECT ON public.zone_summary TO service_role;
GRANT SELECT ON public.zone_summary TO authenticated;
GRANT SELECT ON public.zone_summary TO anon;

-- ============================================================================
-- STEP 4: Verification
-- ============================================================================
-- After running, verify:
-- SELECT * FROM zone_summary LIMIT 5;
-- Should now show project_id column.
--
-- Test project filtering:
-- SELECT * FROM zone_summary WHERE project_id = '<your-project-uuid>';

RAISE NOTICE '✅ Migration 008 complete — zone_summary view now includes project_id';

-- ============================================================================
-- ROLLBACK (restore original view without project_id)
-- ============================================================================
-- DROP VIEW IF EXISTS public.zone_summary;
-- CREATE VIEW public.zone_summary AS
-- SELECT
--   lz.id,
--   lz.zone_code,
--   lz.zone_name,
--   COUNT(t.id)::int AS total_trees,
--   COUNT(t.id) FILTER (WHERE t.status = 'completed')::int AS completed
-- FROM public.land_zones lz
-- LEFT JOIN public.trees t ON t.zone_id = lz.id
-- GROUP BY lz.id, lz.zone_code, lz.zone_name;
--
-- GRANT SELECT ON public.zone_summary TO service_role;
-- GRANT SELECT ON public.zone_summary TO authenticated;
-- GRANT SELECT ON public.zone_summary TO anon;
