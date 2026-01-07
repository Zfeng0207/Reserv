-- Add map_url and payment_qr_image columns to sessions table

-- Add map_url column for storing Google Maps links
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS map_url text;

-- Add payment_qr_image column for storing payment QR code images (base64 data URLs)
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS payment_qr_image text;

-- Add comments for documentation
COMMENT ON COLUMN sessions.map_url IS 'Google Maps URL for the session location. Used for embedding map previews.';
COMMENT ON COLUMN sessions.payment_qr_image IS 'Payment QR code image stored as base64 data URL. Used for displaying payment QR codes to participants.';

