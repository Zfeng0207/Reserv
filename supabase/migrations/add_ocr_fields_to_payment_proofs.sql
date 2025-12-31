-- Add OCR-related columns to payment_proofs table
-- This migration adds fields needed for OCR scanning of payment proof images

-- Add image URL column (stores Supabase Storage URL)
ALTER TABLE public.payment_proofs 
ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

-- Add extracted bank details columns (populated by OCR)
ALTER TABLE public.payment_proofs 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS account_name TEXT;

-- Add scanned_at timestamp (when OCR was completed)
ALTER TABLE public.payment_proofs 
ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN public.payment_proofs.proof_image_url IS 'URL to the payment proof image in Supabase Storage';
COMMENT ON COLUMN public.payment_proofs.bank_name IS 'Bank name extracted from OCR (e.g., "Maybank", "CIMB")';
COMMENT ON COLUMN public.payment_proofs.account_number IS 'Account number extracted from OCR';
COMMENT ON COLUMN public.payment_proofs.account_name IS 'Account holder name extracted from OCR';
COMMENT ON COLUMN public.payment_proofs.scanned_at IS 'Timestamp when OCR scan was completed';
COMMENT ON COLUMN public.payment_proofs.ocr_payload IS 'Full OCR result JSON (includes raw_text, confidence_notes, etc.)';
COMMENT ON COLUMN public.payment_proofs.ocr_confidence IS 'Confidence score (0-1) for OCR extraction quality';

-- Note: ocr_status enum already exists: 'pending' | 'success' | 'failed'
-- Note: ocr_payload (JSONB) already exists for storing full OCR results

