-- Add covered_participant_ids JSONB column to payment_proofs
-- This allows a single payment proof to cover multiple participants
-- Example: [{"participant_id": "uuid1"}, {"participant_id": "uuid2"}]

ALTER TABLE public.payment_proofs
ADD COLUMN IF NOT EXISTS covered_participant_ids jsonb DEFAULT '[]'::jsonb;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_payment_proofs_covered_participants 
ON public.payment_proofs USING gin (covered_participant_ids);

-- Add comment
COMMENT ON COLUMN public.payment_proofs.covered_participant_ids IS 'Array of participant IDs covered by this payment proof. Allows one payment to cover multiple participants.';

-- For backward compatibility, migrate existing records:
-- If covered_participant_ids is empty and participant_id exists, populate it
UPDATE public.payment_proofs
SET covered_participant_ids = jsonb_build_array(jsonb_build_object('participant_id', participant_id))
WHERE (covered_participant_ids IS NULL OR covered_participant_ids = '[]'::jsonb)
  AND participant_id IS NOT NULL;

