-- Add 'futsal' to sport_type enum
-- This migration adds futsal as a new sport type option

ALTER TYPE sport_type ADD VALUE IF NOT EXISTS 'futsal';

