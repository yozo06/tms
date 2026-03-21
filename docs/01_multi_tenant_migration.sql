-- Migration: Arbor V2 Multi-Tenant Projects & RBAC
-- Instructions: Run this script directly in the Supabase SQL Editor

-- 1. Create the projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id bigint REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- 2. Create the granular project roles enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_role') THEN
        CREATE TYPE project_role AS ENUM ('admin', 'editor', 'contributor', 'viewer');
    END IF;
END$$;

-- 3. Create the project_members junction table
CREATE TABLE IF NOT EXISTS public.project_members (
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id bigint REFERENCES public.users(id) ON DELETE CASCADE,
  role project_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- 4. Alter existing core tables to belong to dynamically created projects later
ALTER TABLE public.trees ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.land_zones ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Note: In a production environment with existing data, we would:
-- a) CREATE a default project.
-- b) UPDATE existing trees and zones to point to the default project id.
-- c) Make project_id NOT NULL after backfilling. 
-- Since we are migrating manually, we leave it nullable for a smooth transition.
