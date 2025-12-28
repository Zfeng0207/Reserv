import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server/server";
import { PublicSessionView } from "./public-session-view";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch session (public read)
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (sessionError || !session) {
    notFound();
  }

  // Only show open sessions to public (or allow draft for preview purposes)
  if (session.status !== "open" && session.status !== "draft") {
    notFound();
  }

  // Fetch participants (only display names for public)
  const { data: participants = [] } = await supabase
    .from("participants")
    .select("id, display_name")
    .eq("session_id", id)
    .in("status", ["invited", "confirmed"]);

  // Fetch host info (minimal)
  const { data: host } = await supabase
    .from("users")
    .select("id")
    .eq("id", session.host_id)
    .single();

  const spotsLeft = session.capacity
    ? Math.max(0, session.capacity - participants.length)
    : 0;

  return (
    <PublicSessionView
      session={session}
      participants={participants}
      spotsLeft={spotsLeft}
      hostName={host?.id || "Host"}
    />
  );
}

