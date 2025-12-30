-- Add public_code and host_slug columns to sessions table for public invite routing
-- public_code: unique short code (6 chars) used for lookup
-- host_slug: URL-friendly slug for cosmetic URL (can change, not used for lookup)

-- Add columns
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS public_code TEXT,
ADD COLUMN IF NOT EXISTS host_slug TEXT;

-- Create unique index on public_code (for fast lookup and uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_public_code ON public.sessions(public_code)
WHERE public_code IS NOT NULL;

-- Create index on public_code and status for public queries
CREATE INDEX IF NOT EXISTS idx_sessions_public_code_status ON public.sessions(public_code, status)
WHERE public_code IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.sessions.public_code IS 'Unique short code (6 characters) for public invite URL. Generated once when session is published.';
COMMENT ON COLUMN public.sessions.host_slug IS 'URL-friendly slug derived from host name for cosmetic URL purposes. Can change without breaking invites.';

