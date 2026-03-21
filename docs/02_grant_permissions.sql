-- Migration Permissions Fix
-- Run this in the Supabase SQL Editor if the server reports 'permission denied'

GRANT ALL ON TABLE public.projects TO service_role;
GRANT ALL ON TABLE public.projects TO authenticated;
GRANT ALL ON TABLE public.projects TO anon;

GRANT ALL ON TABLE public.project_members TO service_role;
GRANT ALL ON TABLE public.project_members TO authenticated;
GRANT ALL ON TABLE public.project_members TO anon;

-- Apply grants to sequences for auto-incrementing if any exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
