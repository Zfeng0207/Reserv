-- Add host_name column to sessions table
-- This allows customizing the host display name per session
-- If NULL, it will fallback to the user's profile name

ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS host_name VARCHAR(40);

COMMENT ON COLUMN public.sessions.host_name IS 'Custom host display name for this session. If NULL, defaults to user profile name.';

