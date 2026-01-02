"use server"

import { createClient, getUserId, createAdminClient } from "@/lib/supabase/server/server"
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
 * Get user profile (email, display name, and avatar from profiles table and auth metadata)
 */
export async function getUserProfile(): Promise<
  | { ok: true; email: string; displayName: string | null; avatarUrl: string | null; googleAvatarUrl: string | null }
  | { ok: false; error: string }
> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { ok: false, error: "Unauthorized" }
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: userError?.message || "User not found" }
  }

  // Get profile from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", userId)
    .single()

  // Get Google avatar from user metadata (if available)
  const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

  const displayName = profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.display_name || null

  return {
    ok: true,
    email: user.email || "",
    displayName,
    avatarUrl: profile?.avatar_url || null,
    googleAvatarUrl,
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

/**
 * Upload avatar image to Supabase Storage and update profile
 */
export async function uploadAvatar(
  fileData: string, // base64 encoded image
  fileName: string,
  contentType: string
): Promise<{ ok: true; avatarUrl: string } | { ok: false; error: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { ok: false, error: "Unauthorized" }
  }

  // Convert base64 to buffer
  const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "")
  const buffer = Buffer.from(base64Data, "base64")

  // Validate file size (3MB max)
  if (buffer.length > 3 * 1024 * 1024) {
    return { ok: false, error: "Image size must be less than 3MB" }
  }

  // Validate content type
  if (!contentType.startsWith("image/")) {
    return { ok: false, error: "File must be an image" }
  }

  // Determine file extension from content type
  const ext = contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg"

  // Storage path: avatars/{userId}/avatar.{ext}
  const storagePath = `${userId}/avatar.${ext}`

  // Use admin client for storage operations (bypasses RLS)
  const adminClient = createAdminClient()

  try {
    // Upload to storage (upsert = true to replace existing)
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from("avatars")
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      console.error("[uploadAvatar] Storage upload error:", uploadError)
      return { ok: false, error: uploadError.message || "Failed to upload image" }
    }

    // Get public URL
    const { data: urlData } = adminClient.storage.from("avatars").getPublicUrl(storagePath)

    if (!urlData?.publicUrl) {
      return { ok: false, error: "Failed to get image URL" }
    }

    // Update profile in database
    const { error: updateError } = await adminClient
      .from("profiles")
      .upsert({
        id: userId,
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })

    if (updateError) {
      console.error("[uploadAvatar] Database update error:", updateError)
      // Clean up storage file if DB update fails
      await adminClient.storage.from("avatars").remove([storagePath])
      return { ok: false, error: updateError.message || "Failed to update profile" }
    }

    revalidatePath("/host/settings")
    revalidatePath("/host/sessions") // In case avatar is shown in session list
    // Also revalidate public invite pages (they'll refresh on next load)

    return { ok: true, avatarUrl: urlData.publicUrl }
  } catch (error: any) {
    console.error("[uploadAvatar] Unexpected error:", error)
    return { ok: false, error: error.message || "Failed to upload avatar" }
  }
}

/**
 * Remove avatar (delete from storage and clear profile)
 */
export async function removeAvatar(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { ok: false, error: "Unauthorized" }
  }

  // Get current profile to find storage path
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .single()

  const adminClient = createAdminClient()

  try {
    // Delete from storage if exists
    if (profile?.avatar_url) {
      // Extract path from URL (avatars/{userId}/avatar.{ext})
      const urlPath = profile.avatar_url.split("/avatars/")[1]
      if (urlPath) {
        await adminClient.storage.from("avatars").remove([urlPath])
      }
    }

    // Clear avatar_url in profile
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (updateError) {
      console.error("[removeAvatar] Database update error:", updateError)
      return { ok: false, error: updateError.message || "Failed to remove avatar" }
    }

    revalidatePath("/host/settings")
    revalidatePath("/host/sessions")

    return { ok: true }
  } catch (error: any) {
    console.error("[removeAvatar] Unexpected error:", error)
    return { ok: false, error: error.message || "Failed to remove avatar" }
  }
}

