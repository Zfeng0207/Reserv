-- Enable RLS on participants table
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Revoke default grants (RLS enabled means policies control access)
REVOKE ALL ON TABLE public.participants FROM anon;
REVOKE ALL ON TABLE public.participants FROM authenticated;

-- Grant back what policies will allow
GRANT SELECT, INSERT ON TABLE public.participants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.participants TO authenticated;

-- ============================================================================
-- RLS POLICIES
-- Drop existing policies if they exist (idempotent)
-- ============================================================================

DROP POLICY IF EXISTS "public_insert_participants_open_sessions" ON public.participants;
DROP POLICY IF EXISTS "authenticated_insert_participants_open_sessions" ON public.participants;
DROP POLICY IF EXISTS "public_select_confirmed_participants_open_sessions" ON public.participants;
DROP POLICY IF EXISTS "host_select_all_participants_own_sessions" ON public.participants;
DROP POLICY IF EXISTS "host_update_participants_own_sessions" ON public.participants;
DROP POLICY IF EXISTS "host_delete_participants_own_sessions" ON public.participants;

-- PUBLIC INSERT: Anonymous users can insert participants for open (published) sessions
-- This allows guests to join or decline sessions
CREATE POLICY "public_insert_participants_open_sessions"
ON public.participants
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE sessions.id = participants.session_id
      AND sessions.status = 'open'
  )
);

-- AUTHENTICATED INSERT: Authenticated users can also insert participants for open sessions
-- This allows logged-in users (including hosts joining other sessions) to join/decline
CREATE POLICY "authenticated_insert_participants_open_sessions"
ON public.participants
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE sessions.id = participants.session_id
      AND sessions.status = 'open'
  )
);

-- PUBLIC SELECT: Anonymous users can read confirmed participants for open sessions
-- This allows public invite pages to show who's going
CREATE POLICY "public_select_confirmed_participants_open_sessions"
ON public.participants
FOR SELECT
TO anon
USING (
  status = 'confirmed'
  AND EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE sessions.id = participants.session_id
      AND sessions.status = 'open'
  )
);

-- HOST ACCESS: Authenticated users can read all participants for their own sessions
-- This allows hosts to see both confirmed and declined participants
CREATE POLICY "host_select_all_participants_own_sessions"
ON public.participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE sessions.id = participants.session_id
      AND sessions.host_id = auth.uid()
  )
);

-- HOST ACCESS: Authenticated users can update participants for their own sessions
CREATE POLICY "host_update_participants_own_sessions"
ON public.participants
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE sessions.id = participants.session_id
      AND sessions.host_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE sessions.id = participants.session_id
      AND sessions.host_id = auth.uid()
  )
);

-- HOST ACCESS: Authenticated users can delete participants for their own sessions
CREATE POLICY "host_delete_participants_own_sessions"
ON public.participants
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE sessions.id = participants.session_id
      AND sessions.host_id = auth.uid()
  )
);

-- Add comment
COMMENT ON TABLE public.participants IS 'Session participants with RLS enabled. Public (anon) can insert participants for open sessions and read confirmed participants. Hosts (authenticated) can manage all participants for their own sessions.';

