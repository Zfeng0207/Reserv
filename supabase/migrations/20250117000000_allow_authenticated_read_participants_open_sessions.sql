-- Allow authenticated users (who are not hosts) to read participants for open sessions
-- This fixes the issue where logged-in users can't see participants after hard refresh

DROP POLICY IF EXISTS "authenticated_select_participants_open_sessions" ON public.participants;

-- AUTHENTICATED ACCESS: Authenticated users can read confirmed and waitlisted participants for open sessions
-- This allows logged-in users (who are not hosts) to view public session invite pages
CREATE POLICY "authenticated_select_participants_open_sessions"
ON public.participants
FOR SELECT
TO authenticated
USING (
  status IN ('confirmed', 'waitlisted')
  AND EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE sessions.id = participants.session_id
      AND sessions.status = 'open'
  )
);

COMMENT ON POLICY "authenticated_select_participants_open_sessions" ON public.participants IS
'Allows authenticated users (who are not hosts) to read confirmed and waitlisted participants for open sessions. This enables logged-in users to view public session invite pages and see who has joined.';

