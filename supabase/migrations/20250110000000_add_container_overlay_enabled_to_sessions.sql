-- Add container_overlay_enabled column to sessions table
-- This stores the host's preference for the text container overlay (readability backdrop)
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS container_overlay_enabled boolean DEFAULT true;

