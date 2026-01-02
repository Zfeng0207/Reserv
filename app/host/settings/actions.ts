"use server"

import { createClient, getUserId } from "@/lib/supabase/server/server"
import { revalidatePath } from "next/cache"

export interface HostSettings {
  require_payment_proof_default: boolean
  waiting_list_default: boolean
  auto_close_when_full_default: boolean
  show_guest_list_publicly_default: boolean
  allow_cash_payments: boolean
  default_payment_instructions: string | null
  auto_unpublish_enabled: boolean
  auto_delete_participant_data: boolean
}

/**
 * Get host settings (create default row if doesn't exist)
 */
export async function getHostSettings(): Promise<
  | { ok: true; settings: HostSettings }
  | { ok: false; error: string }
> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { ok: false, error: "Unauthorized" }
  }

  // Try to get existing settings
  const { data: existing, error: selectError } = await supabase
    .from("host_settings")
    .select("*")
    .eq("host_id", userId)
    .single()

  if (selectError && selectError.code !== "PGRST116") {
    // PGRST116 = not found, which is OK - we'll create defaults
    console.error("[getHostSettings] Error fetching settings:", selectError)
    return { ok: false, error: selectError.message }
  }

  // If settings exist, return them
  if (existing) {
    return {
      ok: true,
      settings: {
        require_payment_proof_default: existing.require_payment_proof_default ?? true,
        waiting_list_default: existing.waiting_list_default ?? true,
        auto_close_when_full_default: existing.auto_close_when_full_default ?? true,
        show_guest_list_publicly_default: existing.show_guest_list_publicly_default ?? true,
        allow_cash_payments: existing.allow_cash_payments ?? true,
        default_payment_instructions: existing.default_payment_instructions ?? null,
        auto_unpublish_enabled: existing.auto_unpublish_enabled ?? true,
        auto_delete_participant_data: existing.auto_delete_participant_data ?? true,
      },
    }
  }

  // Create default settings
  const { data: newSettings, error: insertError } = await supabase
    .from("host_settings")
    .insert({
      host_id: userId,
      require_payment_proof_default: true,
      waiting_list_default: true,
      auto_close_when_full_default: true,
      show_guest_list_publicly_default: true,
      allow_cash_payments: true,
      default_payment_instructions: null,
      auto_unpublish_enabled: true,
      auto_delete_participant_data: true,
    })
    .select()
    .single()

  if (insertError) {
    console.error("[getHostSettings] Error creating default settings:", insertError)
    return { ok: false, error: insertError.message }
  }

  return {
    ok: true,
    settings: {
      require_payment_proof_default: newSettings.require_payment_proof_default ?? true,
      waiting_list_default: newSettings.waiting_list_default ?? true,
      auto_close_when_full_default: newSettings.auto_close_when_full_default ?? true,
      show_guest_list_publicly_default: newSettings.show_guest_list_publicly_default ?? true,
      allow_cash_payments: newSettings.allow_cash_payments ?? true,
      default_payment_instructions: newSettings.default_payment_instructions ?? null,
      auto_unpublish_enabled: newSettings.auto_unpublish_enabled ?? true,
      auto_delete_participant_data: newSettings.auto_delete_participant_data ?? true,
    },
  }
}

/**
 * Update host settings
 */
export async function updateHostSettings(
  updates: Partial<HostSettings>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { ok: false, error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("host_settings")
    .upsert(
      {
        host_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "host_id",
      }
    )

  if (error) {
    console.error("[updateHostSettings] Error updating settings:", error)
    return { ok: false, error: error.message }
  }

  revalidatePath("/host/settings")
  return { ok: true }
}

/**
 * Get user profile (email and display name from auth metadata)
 */
export async function getUserProfile(): Promise<
  | { ok: true; email: string; displayName: string | null }
  | { ok: false; error: string }
> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { ok: false, error: "Unauthorized" }
  }

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false, error: error?.message || "User not found" }
  }

  const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || null

  return {
    ok: true,
    email: user.email || "",
    displayName,
  }
}

/**
 * Update user display name (stored in user metadata)
 */
export async function updateUserDisplayName(
  displayName: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { ok: false, error: "Unauthorized" }
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName.trim(),
    },
  })

  if (error) {
    console.error("[updateUserDisplayName] Error updating display name:", error)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

/**
 * Delete all drafts for the host
 */
export async function deleteAllDrafts(): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { ok: false, error: "Unauthorized" }
  }

  const { data, error } = await supabase
    .from("session_drafts")
    .delete()
    .eq("host_id", userId)
    .select()

  if (error) {
    console.error("[deleteAllDrafts] Error deleting drafts:", error)
    return { ok: false, error: error.message }
  }

  revalidatePath("/host/settings")
  return { ok: true, count: data?.length || 0 }
}

