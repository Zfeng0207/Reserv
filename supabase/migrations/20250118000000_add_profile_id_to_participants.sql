-- Add profile_id column to participants table
-- profile_id is used to uniquely identify guests per session based on session_id + guest name
-- Format: `${sessionId}-${guestName.trim().toLowerCase()}`
-- This ensures:
-- 1. Same guest name cannot join twice in the same session
-- 2. Guest identity is tied to name + session, not browser cookie
-- 3. Changing name creates a new guest identity

ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS profile_id text;

-- Add unique constraint per session to prevent duplicate guest names
-- This constraint ensures that the same guest name cannot exist twice in the same session
CREATE UNIQUE INDEX IF NOT EXISTS participants_session_profile_id_unique
ON public.participants (session_id, profile_id)
WHERE profile_id IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.participants.profile_id IS 'Unique guest identifier per session. Format: `${sessionId}-${guestName.trim().toLowerCase()}`. Used to prevent duplicate guest names and tie join state to guest name rather than browser cookie.';

