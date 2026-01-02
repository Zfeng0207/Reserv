-- Add court_numbers column to sessions table
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS court_numbers text NULL;

-- Enable RLS on sessions table if not already enabled
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

