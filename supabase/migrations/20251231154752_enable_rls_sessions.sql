-- Enable RLS on sessions table so policies actually apply
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Revoke default grants (RLS enabled means policies control access, but be explicit)
REVOKE ALL ON TABLE public.sessions FROM anon;
REVOKE ALL ON TABLE public.sessions FROM authenticated;

-- Grant back only what policies will allow (Supabase will handle this, but explicit is good practice)
GRANT SELECT ON TABLE public.sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sessions TO authenticated;

-- ============================================================================
-- RLS POLICIES
-- Drop existing policies if they exist (idempotent)
-- ============================================================================

DROP POLICY IF EXISTS "public_select_open_sessions" ON public.sessions;
DROP POLICY IF EXISTS "host_select_own_sessions" ON public.sessions;
DROP POLICY IF EXISTS "host_insert_own_sessions" ON public.sessions;
DROP POLICY IF EXISTS "host_update_own_sessions" ON public.sessions;
DROP POLICY IF EXISTS "host_delete_own_sessions" ON public.sessions;

-- PUBLIC ACCESS: Anonymous users can read open (published) sessions
-- This allows public invite pages to display session details
CREATE POLICY "public_select_open_sessions"
ON public.sessions
FOR SELECT
TO anon
USING (status = 'open');

-- HOST ACCESS: Authenticated users can read their own sessions
CREATE POLICY "host_select_own_sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (host_id = auth.uid());

-- HOST ACCESS: Authenticated users can insert sessions for themselves
CREATE POLICY "host_insert_own_sessions"
ON public.sessions
FOR INSERT
TO authenticated
WITH CHECK (host_id = auth.uid());

-- HOST ACCESS: Authenticated users can update their own sessions
CREATE POLICY "host_update_own_sessions"
ON public.sessions
FOR UPDATE
TO authenticated
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

-- HOST ACCESS: Authenticated users can delete their own sessions
CREATE POLICY "host_delete_own_sessions"
ON public.sessions
FOR DELETE
TO authenticated
USING (host_id = auth.uid());

-- Add comment
COMMENT ON TABLE public.sessions IS 'Session invites with RLS enabled. Public (anon) can only read open sessions. Hosts (authenticated) can manage their own sessions.';

