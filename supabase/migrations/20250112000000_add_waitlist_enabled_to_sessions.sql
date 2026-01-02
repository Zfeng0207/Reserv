-- Add waitlist_enabled column to sessions table
-- Defaults to true (waitlist enabled by default)
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS waitlist_enabled boolean NOT NULL DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN public.sessions.waitlist_enabled IS 'Whether the waiting list feature is enabled for this session. When enabled and session is full, users can join the waitlist.';

