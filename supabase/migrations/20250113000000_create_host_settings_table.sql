-- Create host_settings table for storing host preferences
CREATE TABLE IF NOT EXISTS public.host_settings (
  host_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  require_payment_proof_default boolean NOT NULL DEFAULT true,
  waiting_list_default boolean NOT NULL DEFAULT true,
  auto_close_when_full_default boolean NOT NULL DEFAULT true,
  show_guest_list_publicly_default boolean NOT NULL DEFAULT true,
  allow_cash_payments boolean NOT NULL DEFAULT true,
  default_payment_instructions text,
  auto_unpublish_enabled boolean NOT NULL DEFAULT true,
  auto_delete_participant_data boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.host_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Host can only access their own settings
CREATE POLICY "hosts_can_select_own_settings"
  ON public.host_settings
  FOR SELECT
  USING (auth.uid() = host_id);

CREATE POLICY "hosts_can_insert_own_settings"
  ON public.host_settings
  FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "hosts_can_update_own_settings"
  ON public.host_settings
  FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- Add comment
COMMENT ON TABLE public.host_settings IS 'Host-level preferences and defaults for session creation';

