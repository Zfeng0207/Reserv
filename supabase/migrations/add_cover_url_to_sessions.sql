-- Add cover_url column to sessions table
-- This stores the URL or path to the session's cover image

ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS cover_url TEXT;

COMMENT ON COLUMN public.sessions.cover_url IS 'URL or path to the session cover image. Can be a preset path or Supabase Storage URL.';

