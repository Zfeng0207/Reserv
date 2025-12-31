"use server"

import { createClient } from "@/lib/supabase/server/server"
import { revalidatePath } from "next/cache"

/**
 * Get participant RSVP status for a session (by name and phone)
 * Returns the current status if participant exists, null otherwise
 */
export async function getParticipantRSVPStatus(
  publicCode: string,
  name: string,
  phone?: string | null
): Promise<{ ok: true; status: "confirmed" | "cancelled" | null } | { ok: false; error: string }> {
  const supabase = await createClient()

  // Lookup session by public_code
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id")
    .eq("public_code", publicCode)
    .eq("status", "open")
    .single()

  if (sessionError || !session) {
    return { ok: false, error: "Session not found" }
  }

  // Find existing participant by name and phone
  const trimmedName = name.trim()
  const trimmedPhone = phone?.trim() || null

  let query = supabase
    .from("participants")
    .select("status")
    .eq("session_id", session.id)
    .eq("display_name", trimmedName)

  // If phone provided, match by phone; if not, match participants with null phone
  if (trimmedPhone) {
    query = query.eq("contact_phone", trimmedPhone)
  } else {
    query = query.is("contact_phone", null)
  }

  const { data: participant, error } = await query.single()

  if (error) {
    // Not found is OK (means no RSVP yet)
    if (error.code === "PGRST116") {
      return { ok: true, status: null }
    }
    return { ok: false, error: error.message }
  }

  // Map status to our return type
  if (participant.status === "confirmed") {
    return { ok: true, status: "confirmed" }
  } else if (participant.status === "cancelled") {
    return { ok: true, status: "cancelled" }
  }

  return { ok: true, status: null }
}

/**
 * Join a session by public_code (create or update participant with status "confirmed")
 * Enforces capacity limit server-side
 * Uses UPSERT: updates existing participant or creates new one
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

  const trimmedName = name.trim()
  const trimmedPhone = phone?.trim() || null

  // Check if participant already exists
  let existingQuery = supabase
    .from("participants")
    .select("id, status")
    .eq("session_id", session.id)
    .eq("display_name", trimmedName)

  if (trimmedPhone) {
    existingQuery = existingQuery.eq("contact_phone", trimmedPhone)
  } else {
    existingQuery = existingQuery.is("contact_phone", null)
  }

  const { data: existingParticipant } = await existingQuery.single()

  // If participant already exists, update status
  if (existingParticipant) {
    const { error: updateError } = await supabase
      .from("participants")
      .update({ status: "confirmed" })
      .eq("id", existingParticipant.id)

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    // Revalidate the session page
    if (session.host_slug && publicCode) {
      revalidatePath(`/${session.host_slug}/${publicCode}`)
    }

    return { ok: true }
  }

  // Participant doesn't exist - check capacity before inserting
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

  // Insert new participant
  const { error: insertError } = await supabase.from("participants").insert({
    session_id: session.id,
    display_name: trimmedName,
    contact_phone: trimmedPhone,
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
 * Decline a session by public_code (create or update participant with status "cancelled")
 * Uses UPSERT: updates existing participant or creates new one
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

  const trimmedName = name.trim()
  const trimmedPhone = phone?.trim() || null

  // Check if participant already exists
  let existingQuery = supabase
    .from("participants")
    .select("id")
    .eq("session_id", session.id)
    .eq("display_name", trimmedName)

  if (trimmedPhone) {
    existingQuery = existingQuery.eq("contact_phone", trimmedPhone)
  } else {
    existingQuery = existingQuery.is("contact_phone", null)
  }

  const { data: existingParticipant } = await existingQuery.single()

  // If participant already exists, update status
  if (existingParticipant) {
    const { error: updateError } = await supabase
      .from("participants")
      .update({ status: "cancelled" })
      .eq("id", existingParticipant.id)

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    // Revalidate the session page
    if (session.host_slug && publicCode) {
      revalidatePath(`/${session.host_slug}/${publicCode}`)
    }

    return { ok: true }
  }

  // Insert new participant with cancelled status
  const { error: insertError } = await supabase.from("participants").insert({
    session_id: session.id,
    display_name: trimmedName,
    contact_phone: trimmedPhone,
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

