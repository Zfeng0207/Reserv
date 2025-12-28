import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server/server";
import { PublicSessionView } from "@/app/session/[id]/public-session-view";

export default async function SharedSessionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  // For now, code is the session ID. In the future, you could add a share_code field
  // to the sessions table and query by that instead.
  const sessionId = code;

  // Fetch session (public read)
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    notFound();
  }

  // Only show open sessions to public
  if (session.status !== "open") {
    notFound();
  }

  // Fetch participants (only display names for public)
  const { data: participants = [] } = await supabase
    .from("participants")
    .select("id, display_name")
    .eq("session_id", sessionId)
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

