"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server/server";
import { Database } from "@/types/supabase";

type ParticipantInsert = Database["public"]["Tables"]["participants"]["Insert"];
type PaymentProofInsert = Database["public"]["Tables"]["payment_proofs"]["Insert"];

export async function joinSession(
  sessionId: string,
  participantData: Omit<ParticipantInsert, "id" | "created_at" | "session_id">
) {
  const supabase = await createClient();

  // Check if session exists and is open
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, status, capacity")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return { error: "Session not found" };
  }

  if (session.status !== "open") {
    return { error: "Session is not accepting participants" };
  }

  // Check capacity
  const { count } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .in("status", ["invited", "confirmed"]);

  if (session.capacity && count && count >= session.capacity) {
    return { error: "Session is full" };
  }

  const insertData: ParticipantInsert = {
    ...participantData,
    session_id: sessionId,
    status: "invited",
    created_at: new Date().toISOString(),
  };

  const { data: participant, error } = await supabase
    .from("participants")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/s/${sessionId}`);
  revalidatePath(`/host/sessions/${sessionId}/edit`);
  return { data: participant };
}

export async function leaveSession(sessionId: string, participantId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("participants")
    .update({ status: "cancelled" })
    .eq("id", participantId)
    .eq("session_id", sessionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/s/${sessionId}`);
  revalidatePath(`/host/sessions/${sessionId}/edit`);
  return { success: true };
}

export async function uploadPaymentProof(
  sessionId: string,
  participantId: string,
  paymentData: Omit<PaymentProofInsert, "id" | "created_at" | "session_id" | "participant_id" | "ocr_status" | "payment_status">
) {
  const supabase = await createClient();

  // Verify participant exists and belongs to session
  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("id, session_id")
    .eq("id", participantId)
    .eq("session_id", sessionId)
    .single();

  if (participantError || !participant) {
    return { error: "Participant not found" };
  }

  const insertData: PaymentProofInsert = {
    ...paymentData,
    session_id: sessionId,
    participant_id: participantId,
    ocr_status: "pending",
    payment_status: "pending_review",
    created_at: new Date().toISOString(),
  };

  const { data: paymentProof, error } = await supabase
    .from("payment_proofs")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/s/${sessionId}`);
  revalidatePath(`/host/sessions/${sessionId}/edit`);
  return { data: paymentProof };
}

