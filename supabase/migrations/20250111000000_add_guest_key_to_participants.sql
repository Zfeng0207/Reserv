-- Add guest_key column to participants table
-- This stores a stable device key for anonymous participants, allowing them to be recognized
-- across sessions and reloads
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS guest_key text;

-- Create unique index to ensure one participant per session per guest key
-- This allows UPSERT operations to work correctly
CREATE UNIQUE INDEX IF NOT EXISTS participants_session_guest_key_unique
ON public.participants (session_id, guest_key)
WHERE guest_key IS NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.participants.guest_key IS 'Stable device key for anonymous participants. Used to identify the same guest across sessions and reloads.';

