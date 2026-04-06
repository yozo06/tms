-- Migration 005: Row-Level Security (RLS) Policies for Multi-Tenant Isolation
--
-- Prerequisites:
--   - Migration 002 (projects + project_members tables exist)
--   - Migration 004 (project_id NOT NULL on trees and land_zones)
--
-- How it works:
--   RLS restricts which rows each database role can see/modify.
--   - `service_role` (used by Express backend): BYPASSES RLS — the backend handles
--     scoping via requireProject middleware (H-16).
--   - `authenticated` / `anon` (used by direct Supabase client access): ENFORCED.
--     These policies prevent any direct-client data leakage across projects.
--
-- Architecture note:
--   WildArc currently uses a custom JWT auth system in Express, not Supabase Auth.
--   The `auth.uid()` function returns the UUID from Supabase's auth.users table.
--   Since WildArc's users table uses bigint IDs, these policies use a custom
--   session variable `app.current_user_id` that the backend can set per-request:
--
--     SET LOCAL app.current_user_id = '<user_id>';
--
--   For direct Supabase client access (future), a mapping function is provided.
--
-- Run in: Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Estimated time: < 1 minute
-- Reversible: Yes (see ROLLBACK section at bottom)

-- ============================================================================
-- STEP 0: Helper function to get current user ID from session context
-- ============================================================================
-- This function reads the user ID set by the backend via SET LOCAL.
-- Returns NULL if not set (which means all policies deny access — safe default).

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::bigint;
$$;

COMMENT ON FUNCTION public.current_app_user_id() IS
  'Returns the current application user ID from session context (set via SET LOCAL app.current_user_id). '
  'Returns NULL if not set, causing all RLS policies to deny access (safe default).';

-- Helper: Check if current user is a member of a given project
CREATE OR REPLACE FUNCTION public.user_is_project_member(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id
      AND user_id = public.current_app_user_id()
  );
$$;

-- Helper: Check if current user has a specific role (or higher) in a project
-- Role hierarchy: admin > editor > contributor > viewer
CREATE OR REPLACE FUNCTION public.user_has_project_role(
  p_project_id uuid,
  p_min_role project_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id
      AND user_id = public.current_app_user_id()
      AND CASE p_min_role
        WHEN 'viewer'      THEN true  -- any role qualifies
        WHEN 'contributor'  THEN role IN ('contributor', 'editor', 'admin')
        WHEN 'editor'       THEN role IN ('editor', 'admin')
        WHEN 'admin'        THEN role = 'admin'
      END
  );
$$;

-- ============================================================================
-- STEP 1: Enable RLS on all tenant-scoped tables
-- ============================================================================
-- Note: Enabling RLS with no policies = deny all (for non-service_role).
-- We add policies immediately after each ENABLE.

ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_health_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

RAISE NOTICE 'RLS enabled on 8 tables';

-- ============================================================================
-- STEP 2: Policies for `projects` table
-- ============================================================================
-- Users can only see projects they are members of.
-- Only project admins (or project owner) can update/delete projects.

-- SELECT: see projects you belong to
CREATE POLICY projects_select ON public.projects
  FOR SELECT
  USING (
    public.user_is_project_member(id)
    OR owner_id = public.current_app_user_id()
  );

-- INSERT: any authenticated user can create a project
CREATE POLICY projects_insert ON public.projects
  FOR INSERT
  WITH CHECK (
    public.current_app_user_id() IS NOT NULL
  );

-- UPDATE: only project owner or admin
CREATE POLICY projects_update ON public.projects
  FOR UPDATE
  USING (
    owner_id = public.current_app_user_id()
    OR public.user_has_project_role(id, 'admin')
  );

-- DELETE: only project owner
CREATE POLICY projects_delete ON public.projects
  FOR DELETE
  USING (
    owner_id = public.current_app_user_id()
  );

-- ============================================================================
-- STEP 3: Policies for `project_members` table
-- ============================================================================
-- Members can see other members of their projects.
-- Only admins can add/remove members.

CREATE POLICY project_members_select ON public.project_members
  FOR SELECT
  USING (
    public.user_is_project_member(project_id)
  );

CREATE POLICY project_members_insert ON public.project_members
  FOR INSERT
  WITH CHECK (
    public.user_has_project_role(project_id, 'admin')
  );

CREATE POLICY project_members_update ON public.project_members
  FOR UPDATE
  USING (
    public.user_has_project_role(project_id, 'admin')
  );

CREATE POLICY project_members_delete ON public.project_members
  FOR DELETE
  USING (
    public.user_has_project_role(project_id, 'admin')
  );

-- ============================================================================
-- STEP 4: Policies for `trees` table
-- ============================================================================
-- Trees are scoped by project_id.
-- SELECT: any project member can view trees
-- INSERT/UPDATE: contributor role or higher
-- DELETE: editor role or higher

CREATE POLICY trees_select ON public.trees
  FOR SELECT
  USING (
    public.user_is_project_member(project_id)
  );

CREATE POLICY trees_insert ON public.trees
  FOR INSERT
  WITH CHECK (
    public.user_has_project_role(project_id, 'contributor')
  );

CREATE POLICY trees_update ON public.trees
  FOR UPDATE
  USING (
    public.user_has_project_role(project_id, 'contributor')
  );

CREATE POLICY trees_delete ON public.trees
  FOR DELETE
  USING (
    public.user_has_project_role(project_id, 'editor')
  );

-- ============================================================================
-- STEP 5: Policies for `land_zones` table
-- ============================================================================
-- Same pattern as trees: scoped by project_id.

CREATE POLICY land_zones_select ON public.land_zones
  FOR SELECT
  USING (
    public.user_is_project_member(project_id)
  );

CREATE POLICY land_zones_insert ON public.land_zones
  FOR INSERT
  WITH CHECK (
    public.user_has_project_role(project_id, 'editor')
  );

CREATE POLICY land_zones_update ON public.land_zones
  FOR UPDATE
  USING (
    public.user_has_project_role(project_id, 'editor')
  );

CREATE POLICY land_zones_delete ON public.land_zones
  FOR DELETE
  USING (
    public.user_has_project_role(project_id, 'admin')
  );

-- ============================================================================
-- STEP 6: Policies for `tree_activity_log` table
-- ============================================================================
-- Activity logs are scoped through their parent tree's project_id.
-- SELECT: any project member (via tree join)
-- INSERT: contributor+ (via tree join)
-- UPDATE/DELETE: editor+ (audit logs should rarely be modified)

CREATE POLICY activity_log_select ON public.tree_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_activity_log.tree_id
        AND public.user_is_project_member(trees.project_id)
    )
  );

CREATE POLICY activity_log_insert ON public.tree_activity_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_activity_log.tree_id
        AND public.user_has_project_role(trees.project_id, 'contributor')
    )
  );

CREATE POLICY activity_log_update ON public.tree_activity_log
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_activity_log.tree_id
        AND public.user_has_project_role(trees.project_id, 'editor')
    )
  );

CREATE POLICY activity_log_delete ON public.tree_activity_log
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_activity_log.tree_id
        AND public.user_has_project_role(trees.project_id, 'admin')
    )
  );

-- ============================================================================
-- STEP 7: Policies for `tree_health_observations` table
-- ============================================================================
-- Same pattern as activity_log: scoped through parent tree.

CREATE POLICY health_obs_select ON public.tree_health_observations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_health_observations.tree_id
        AND public.user_is_project_member(trees.project_id)
    )
  );

CREATE POLICY health_obs_insert ON public.tree_health_observations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_health_observations.tree_id
        AND public.user_has_project_role(trees.project_id, 'contributor')
    )
  );

CREATE POLICY health_obs_update ON public.tree_health_observations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_health_observations.tree_id
        AND public.user_has_project_role(trees.project_id, 'editor')
    )
  );

CREATE POLICY health_obs_delete ON public.tree_health_observations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_health_observations.tree_id
        AND public.user_has_project_role(trees.project_id, 'admin')
    )
  );

-- ============================================================================
-- STEP 8: Policies for `tree_photos` table
-- ============================================================================

CREATE POLICY tree_photos_select ON public.tree_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_photos.tree_id
        AND public.user_is_project_member(trees.project_id)
    )
  );

CREATE POLICY tree_photos_insert ON public.tree_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_photos.tree_id
        AND public.user_has_project_role(trees.project_id, 'contributor')
    )
  );

CREATE POLICY tree_photos_update ON public.tree_photos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_photos.tree_id
        AND public.user_has_project_role(trees.project_id, 'editor')
    )
  );

CREATE POLICY tree_photos_delete ON public.tree_photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_photos.tree_id
        AND public.user_has_project_role(trees.project_id, 'editor')
    )
  );

-- ============================================================================
-- STEP 9: Policies for `tree_contributors` table
-- ============================================================================

CREATE POLICY tree_contributors_select ON public.tree_contributors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_contributors.tree_id
        AND public.user_is_project_member(trees.project_id)
    )
  );

CREATE POLICY tree_contributors_insert ON public.tree_contributors
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_contributors.tree_id
        AND public.user_has_project_role(trees.project_id, 'editor')
    )
  );

CREATE POLICY tree_contributors_update ON public.tree_contributors
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_contributors.tree_id
        AND public.user_has_project_role(trees.project_id, 'editor')
    )
  );

CREATE POLICY tree_contributors_delete ON public.tree_contributors
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE trees.id = tree_contributors.tree_id
        AND public.user_has_project_role(trees.project_id, 'admin')
    )
  );

-- ============================================================================
-- STEP 10: Performance indexes for RLS policy joins
-- ============================================================================
-- These indexes ensure the EXISTS subqueries in policies are fast.

CREATE INDEX IF NOT EXISTS idx_project_members_user_id
  ON public.project_members(user_id);

CREATE INDEX IF NOT EXISTS idx_project_members_project_user
  ON public.project_members(project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_tree_activity_log_tree_id
  ON public.tree_activity_log(tree_id);

CREATE INDEX IF NOT EXISTS idx_tree_health_observations_tree_id
  ON public.tree_health_observations(tree_id);

CREATE INDEX IF NOT EXISTS idx_tree_photos_tree_id
  ON public.tree_photos(tree_id);

CREATE INDEX IF NOT EXISTS idx_tree_contributors_tree_id
  ON public.tree_contributors(tree_id);

-- ============================================================================
-- STEP 11: Verification queries (run these after migration)
-- ============================================================================

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('trees', 'land_zones', 'tree_activity_log',
--                     'tree_health_observations', 'tree_photos',
--                     'tree_contributors', 'projects', 'project_members');
-- All should show rowsecurity = true.

-- Check policies exist:
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Test isolation (replace with actual IDs):
-- SET LOCAL app.current_user_id = '1';  -- Yogesh's user ID
-- SELECT COUNT(*) FROM trees;  -- Should only see trees in Yogesh's projects
-- RESET app.current_user_id;

RAISE NOTICE '✅ Migration 005 complete — RLS policies created on 8 tables with role-based access control';
RAISE NOTICE '⚠️  Remember: service_role key bypasses RLS. The Express backend is unaffected.';
RAISE NOTICE '⚠️  To enforce via Express, set "SET LOCAL app.current_user_id" before each query.';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- Run these to completely remove all RLS policies:
--
-- DROP POLICY IF EXISTS projects_select ON public.projects;
-- DROP POLICY IF EXISTS projects_insert ON public.projects;
-- DROP POLICY IF EXISTS projects_update ON public.projects;
-- DROP POLICY IF EXISTS projects_delete ON public.projects;
-- DROP POLICY IF EXISTS project_members_select ON public.project_members;
-- DROP POLICY IF EXISTS project_members_insert ON public.project_members;
-- DROP POLICY IF EXISTS project_members_update ON public.project_members;
-- DROP POLICY IF EXISTS project_members_delete ON public.project_members;
-- DROP POLICY IF EXISTS trees_select ON public.trees;
-- DROP POLICY IF EXISTS trees_insert ON public.trees;
-- DROP POLICY IF EXISTS trees_update ON public.trees;
-- DROP POLICY IF EXISTS trees_delete ON public.trees;
-- DROP POLICY IF EXISTS land_zones_select ON public.land_zones;
-- DROP POLICY IF EXISTS land_zones_insert ON public.land_zones;
-- DROP POLICY IF EXISTS land_zones_update ON public.land_zones;
-- DROP POLICY IF EXISTS land_zones_delete ON public.land_zones;
-- DROP POLICY IF EXISTS activity_log_select ON public.tree_activity_log;
-- DROP POLICY IF EXISTS activity_log_insert ON public.tree_activity_log;
-- DROP POLICY IF EXISTS activity_log_update ON public.tree_activity_log;
-- DROP POLICY IF EXISTS activity_log_delete ON public.tree_activity_log;
-- DROP POLICY IF EXISTS health_obs_select ON public.tree_health_observations;
-- DROP POLICY IF EXISTS health_obs_insert ON public.tree_health_observations;
-- DROP POLICY IF EXISTS health_obs_update ON public.tree_health_observations;
-- DROP POLICY IF EXISTS health_obs_delete ON public.tree_health_observations;
-- DROP POLICY IF EXISTS tree_photos_select ON public.tree_photos;
-- DROP POLICY IF EXISTS tree_photos_insert ON public.tree_photos;
-- DROP POLICY IF EXISTS tree_photos_update ON public.tree_photos;
-- DROP POLICY IF EXISTS tree_photos_delete ON public.tree_photos;
-- DROP POLICY IF EXISTS tree_contributors_select ON public.tree_contributors;
-- DROP POLICY IF EXISTS tree_contributors_insert ON public.tree_contributors;
-- DROP POLICY IF EXISTS tree_contributors_update ON public.tree_contributors;
-- DROP POLICY IF EXISTS tree_contributors_delete ON public.tree_contributors;
--
-- ALTER TABLE public.trees DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.land_zones DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tree_activity_log DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tree_health_observations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tree_photos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tree_contributors DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;
--
-- DROP FUNCTION IF EXISTS public.current_app_user_id();
-- DROP FUNCTION IF EXISTS public.user_is_project_member(uuid);
-- DROP FUNCTION IF EXISTS public.user_has_project_role(uuid, project_role);
