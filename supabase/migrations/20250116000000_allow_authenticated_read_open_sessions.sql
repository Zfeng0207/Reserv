-- Allow authenticated users to read open sessions (for joining public sessions)
-- This fixes the issue where authenticated users (who are not hosts) cannot view public session pages

DROP POLICY IF EXISTS "authenticated_select_open_sessions" ON public.sessions;

-- AUTHENTICATED ACCESS: Authenticated users can read open (published) sessions
-- This allows logged-in users to view and join public sessions
CREATE POLICY "authenticated_select_open_sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (status = 'open');

COMMENT ON POLICY "authenticated_select_open_sessions" ON public.sessions IS
'Allows authenticated users to read open sessions. This enables logged-in users (who are not hosts) to view and join public session invite pages.';

