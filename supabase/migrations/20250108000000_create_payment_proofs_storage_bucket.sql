-- Storage policies for payment-proofs bucket
-- NOTE: You must create the bucket manually via Supabase Dashboard first:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: "payment-proofs"
-- 4. Make it Public
-- 5. Optional: Set file size limit to 5MB
-- 6. Optional: Set allowed MIME types to: image/jpeg, image/jpg, image/png, image/webp, image/gif
--
-- Then run this migration to set up the storage policies.
-- If bucket doesn't exist, these policies will fail silently.

-- Allow anonymous users to upload files (INSERT)
DROP POLICY IF EXISTS "Allow anonymous uploads to payment-proofs" ON storage.objects;

CREATE POLICY "Allow anonymous uploads to payment-proofs"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = 'payment-proofs'
);

-- Allow authenticated users to upload files (INSERT)
DROP POLICY IF EXISTS "Allow authenticated uploads to payment-proofs" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to payment-proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = 'payment-proofs'
);

-- Allow public read access (SELECT)
DROP POLICY IF EXISTS "Allow public read access to payment-proofs" ON storage.objects;

CREATE POLICY "Allow public read access to payment-proofs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');

-- Allow authenticated users (hosts) to delete files (DELETE)
DROP POLICY IF EXISTS "Allow hosts to delete payment-proofs" ON storage.objects;

CREATE POLICY "Allow hosts to delete payment-proofs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  -- Hosts can delete files from their own sessions
  -- Note: This is a basic policy; you may want to add session ownership validation
);

-- Note: Bucket must be created via Supabase Dashboard first
-- After creating the bucket, these policies will enable anonymous uploads

