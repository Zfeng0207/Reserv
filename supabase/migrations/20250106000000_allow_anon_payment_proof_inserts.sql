-- Allow anonymous users to insert payment proofs for sessions they're participating in
-- This allows participants (who are not authenticated) to submit payment proofs

DROP POLICY IF EXISTS "participants_can_insert_own_payment_proofs_anon" ON public.payment_proofs;

-- ANONYMOUS PARTICIPANTS: Can insert their own payment proofs for sessions they're participating in
-- Validates that participant exists and is linked to the session
CREATE POLICY "participants_can_insert_own_payment_proofs_anon"
ON public.payment_proofs
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.participants p
    WHERE p.id = payment_proofs.participant_id
      AND p.session_id = payment_proofs.session_id
      -- Additional validation: session must be open
      AND EXISTS (
        SELECT 1
        FROM public.sessions s
        WHERE s.id = p.session_id
          AND s.status = 'open'
      )
  )
);

-- Grant INSERT to anon (was previously only SELECT)
GRANT INSERT ON TABLE public.payment_proofs TO anon;

COMMENT ON POLICY "participants_can_insert_own_payment_proofs_anon" ON public.payment_proofs IS 'Allows anonymous participants to insert payment proofs for sessions they have joined. Validates participant exists and session is open.';

