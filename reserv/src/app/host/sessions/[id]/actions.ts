"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUserId } from "@/lib/supabase/server/server";
import { Database } from "@/types/supabase";

type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];
type SessionUpdate = Database["public"]["Tables"]["sessions"]["Update"];

export async function createSession(data: Omit<SessionInsert, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const sessionData: SessionInsert = {
    ...data,
    host_id: userId,
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: session, error } = await supabase
    .from("sessions")
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/host/sessions");
  return { data: session };
}

export async function updateSession(
  sessionId: string,
  data: SessionUpdate
) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Verify user owns this session
  const { data: existingSession, error: fetchError } = await supabase
    .from("sessions")
    .select("host_id")
    .eq("id", sessionId)
    .single();

  if (fetchError || !existingSession) {
    return { error: "Session not found" };
  }

  if (existingSession.host_id !== userId) {
    return { error: "Unauthorized" };
  }

  const updateData: SessionUpdate = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: session, error } = await supabase
    .from("sessions")
    .update(updateData)
    .eq("id", sessionId)
    .eq("host_id", userId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/host/sessions/${sessionId}/edit`);
  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/s/${sessionId}`);
  return { data: session };
}

export async function publishSession(sessionId: string) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Verify user owns this session
  const { data: existingSession, error: fetchError } = await supabase
    .from("sessions")
    .select("host_id")
    .eq("id", sessionId)
    .single();

  if (fetchError || !existingSession) {
    return { error: "Session not found" };
  }

  if (existingSession.host_id !== userId) {
    return { error: "Unauthorized" };
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .update({
      status: "open",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("host_id", userId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/host/sessions/${sessionId}/edit`);
  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/s/${sessionId}`);
  return { data: session };
}

export async function saveDraftSession(
  sessionId: string,
  data: SessionUpdate
) {
  // Same as updateSession but ensures status stays as draft
  return updateSession(sessionId, {
    ...data,
    status: "draft",
  });
}

