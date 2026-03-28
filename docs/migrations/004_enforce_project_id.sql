-- Migration 004: Enforce project_id NOT NULL on trees and land_zones
-- 
-- Context: Migration 002 added project_id as nullable to trees and land_zones
-- to allow a smooth transition. This migration completes multi-tenancy enforcement
-- by ensuring every tree and zone belongs to a project (NOT NULL constraint).
--
-- ⚠️  IMPORTANT: Run this AFTER migration 002 and 003 have been applied.
-- ⚠️  This migration is DESTRUCTIVE if data exists — read all comments before running.
--
-- Instructions: Run in Supabase SQL Editor (Settings → SQL Editor → New query)
-- Estimated time: < 1 second on a small dataset; test in staging first.
--
-- ===========================================================================
-- STEP 1: Inspect existing data (run this first to understand your state)
-- ===========================================================================
-- Uncomment and run these SELECT statements before proceeding:
--
-- SELECT COUNT(*) FROM public.trees WHERE project_id IS NULL;
-- SELECT COUNT(*) FROM public.land_zones WHERE project_id IS NULL;
-- SELECT COUNT(*) FROM public.projects;
--
-- If all counts are 0 for the NULLs, skip to Step 3.

-- ===========================================================================
-- STEP 2: Backfill — create a default project and assign orphaned rows
-- ===========================================================================
-- This step is safe to run even if no orphaned rows exist (it's idempotent).

DO $$
DECLARE
  default_project_id uuid;
  owner_user_id bigint;
BEGIN
  -- Only run backfill if there are any NULL project_id rows
  IF EXISTS (
    SELECT 1 FROM public.trees WHERE project_id IS NULL
    UNION ALL
    SELECT 1 FROM public.land_zones WHERE project_id IS NULL
    LIMIT 1
  ) THEN
    -- Get or create a default project owned by the first admin/owner user
    SELECT id INTO default_project_id
    FROM public.projects
    ORDER BY created_at ASC
    LIMIT 1;

    IF default_project_id IS NULL THEN
      -- No projects exist yet — create a default one
      -- Find the first owner user to assign ownership
      SELECT id INTO owner_user_id
      FROM public.users
      WHERE role = 'owner'
      ORDER BY id ASC
      LIMIT 1;

      IF owner_user_id IS NULL THEN
        -- Fall back to any active user
        SELECT id INTO owner_user_id
        FROM public.users
        WHERE is_active = true
        ORDER BY id ASC
        LIMIT 1;
      END IF;

      INSERT INTO public.projects (name, description, owner_id)
      VALUES ('Default Project', 'Auto-created during migration 004 to backfill orphaned records', owner_user_id)
      RETURNING id INTO default_project_id;

      RAISE NOTICE 'Created default project: %', default_project_id;
    ELSE
      RAISE NOTICE 'Using existing project: %', default_project_id;
    END IF;

    -- Backfill trees with no project
    UPDATE public.trees
    SET project_id = default_project_id
    WHERE project_id IS NULL;

    RAISE NOTICE 'Backfilled trees: % rows', (SELECT COUNT(*) FROM public.trees WHERE project_id = default_project_id);

    -- Backfill land_zones with no project
    UPDATE public.land_zones
    SET project_id = default_project_id
    WHERE project_id IS NULL;

    RAISE NOTICE 'Backfilled land_zones: % rows', (SELECT COUNT(*) FROM public.land_zones WHERE project_id = default_project_id);

  ELSE
    RAISE NOTICE 'No orphaned rows found — skipping backfill.';
  END IF;
END $$;

-- ===========================================================================
-- STEP 3: Verify no NULLs remain before adding NOT NULL constraint
-- ===========================================================================
-- Run this to confirm backfill succeeded before proceeding:
--
-- SELECT COUNT(*) FROM public.trees WHERE project_id IS NULL;       -- must be 0
-- SELECT COUNT(*) FROM public.land_zones WHERE project_id IS NULL;  -- must be 0

-- ===========================================================================
-- STEP 4: Enforce NOT NULL — add the constraint
-- ===========================================================================
ALTER TABLE public.trees
  ALTER COLUMN project_id SET NOT NULL;

ALTER TABLE public.land_zones
  ALTER COLUMN project_id SET NOT NULL;

-- ===========================================================================
-- STEP 5: Add indexes for query performance on project-scoped lookups
-- ===========================================================================
CREATE INDEX IF NOT EXISTS idx_trees_project_id ON public.trees(project_id);
CREATE INDEX IF NOT EXISTS idx_land_zones_project_id ON public.land_zones(project_id);

-- ===========================================================================
-- STEP 6: Verify final state
-- ===========================================================================
-- Run these after migration to confirm:
--
-- SELECT column_name, is_nullable
-- FROM information_schema.columns
-- WHERE table_name IN ('trees', 'land_zones') AND column_name = 'project_id';
-- Expected: is_nullable = 'NO' for both tables
--
-- \d public.trees         -- should show project_id as NOT NULL
-- \d public.land_zones    -- should show project_id as NOT NULL

RAISE NOTICE '✅ Migration 004 complete — project_id is now NOT NULL on trees and land_zones';
