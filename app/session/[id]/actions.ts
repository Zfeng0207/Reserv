"use server"

import { createClient } from "@/lib/supabase/server/server"
import { revalidatePath } from "next/cache"

/**
 * Join a session by public_code (create participant with status "confirmed")
 * Enforces capacity limit server-side
 */
export async function joinSession(
  publicCode: string,
  name: string,
  phone?: string | null
): Promise<{ ok: true } | { ok: false; error: string; code?: "CAPACITY_EXCEEDED" | "SESSION_NOT_FOUND" }> {
  const supabase = await createClient()

  // Lookup session by public_code
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, capacity, status, host_slug")
    .eq("public_code", publicCode)
    .eq("status", "open")
    .single()

  if (sessionError || !session) {
    return { ok: false, error: "Session not found or not available", code: "SESSION_NOT_FOUND" }
  }

  // Check current participant count (only "confirmed" status)
  const { count, error: countError } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("session_id", session.id)
    .eq("status", "confirmed")

  if (countError) {
    return { ok: false, error: countError.message }
  }

  // Check capacity
  if (session.capacity && count !== null && count >= session.capacity) {
    return { ok: false, error: "Session is full", code: "CAPACITY_EXCEEDED" }
  }

  // Insert participant
  const { error: insertError } = await supabase.from("participants").insert({
    session_id: session.id,
    display_name: name.trim(),
    contact_phone: phone?.trim() || null,
    status: "confirmed",
  })

  if (insertError) {
    return { ok: false, error: insertError.message }
  }

  // Revalidate the session page using the hostSlug/code format
  if (session.host_slug && publicCode) {
    revalidatePath(`/${session.host_slug}/${publicCode}`)
  }

  return { ok: true }
}

/**
 * Decline a session by public_code (create participant with status "cancelled")
 */
export async function declineSession(
  publicCode: string,
  name: string,
  phone?: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()

  // Lookup session by public_code
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, status, host_slug")
    .eq("public_code", publicCode)
    .eq("status", "open")
    .single()

  if (sessionError || !session) {
    return { ok: false, error: "Session not found or not available" }
  }

  // Insert participant with cancelled status
  const { error: insertError } = await supabase.from("participants").insert({
    session_id: session.id,
    display_name: name.trim(),
    contact_phone: phone?.trim() || null,
    status: "cancelled",
  })

  if (insertError) {
    return { ok: false, error: insertError.message }
  }

  // Revalidate the session page using the hostSlug/code format
  if (session.host_slug && publicCode) {
    revalidatePath(`/${session.host_slug}/${publicCode}`)
  }

  return { ok: true }
}

/**
 * Get participants for a session by public_code (public view - only "confirmed" status)
 */
export async function getSessionParticipants(publicCode: string): Promise<
  | { ok: true; participants: Array<{ id: string; display_name: string }> }
  | { ok: false; error: string }
> {
  const supabase = await createClient()

  // First get session ID from public_code
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id")
    .eq("public_code", publicCode)
    .single()

  if (sessionError || !session) {
    return { ok: false, error: "Session not found" }
  }

  const { data, error } = await supabase
    .from("participants")
    .select("id, display_name")
    .eq("session_id", session.id)
    .eq("status", "confirmed")
    .order("created_at", { ascending: true })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, participants: data || [] }
}

