-- Allow public users to read waitlisted participants for open sessions
-- This enables the public invite page to display the waitlist

-- Drop existing public SELECT policy
DROP POLICY IF EXISTS "public_select_confirmed_participants_open_sessions" ON public.participants;

-- Create new policy that allows reading both confirmed and waitlisted participants
-- Public users can see who's going (confirmed) and who's on the waitlist (waitlisted)
CREATE POLICY "public_select_participants_open_sessions"
ON public.participants
FOR SELECT
TO anon
USING (
  status IN ('confirmed', 'waitlisted')
  AND EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE sessions.id = participants.session_id
      AND sessions.status = 'open'
  )
);

COMMENT ON POLICY "public_select_participants_open_sessions" ON public.participants IS 
'Allows anonymous users to read confirmed and waitlisted participants for open sessions. This enables public invite pages to display both the attendee list and waitlist.';




