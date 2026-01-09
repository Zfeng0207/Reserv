-- Fix service role access to payment_proofs table
-- The service role key should bypass RLS automatically, but database-level GRANTs are still required

-- In Supabase, when using the service role key, requests are executed as the 'authenticator' role
-- The authenticator role needs explicit GRANTs on tables to perform operations
-- RLS is bypassed, but database-level permissions (GRANTs) are still enforced

-- Grant all permissions to authenticator role (used by service_role key)
GRANT ALL ON TABLE public.payment_proofs TO authenticator;
GRANT ALL ON TABLE public.participants TO authenticator;
GRANT ALL ON TABLE public.sessions TO authenticator;

-- Also ensure postgres role has permissions (fallback)
GRANT ALL ON TABLE public.payment_proofs TO postgres;
GRANT ALL ON TABLE public.participants TO postgres;
GRANT ALL ON TABLE public.sessions TO postgres;

-- Verify RLS is enabled (it should be)
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

-- Note: The service role key bypasses RLS policies, but still requires database-level GRANTs
-- to the authenticator role. This migration ensures those grants are in place.

COMMENT ON TABLE public.payment_proofs IS 'Payment proof uploads with RLS enabled. Service role key bypasses RLS but requires database-level GRANTs to authenticator role.';

