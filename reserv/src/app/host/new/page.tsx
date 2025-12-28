import { redirect } from "next/navigation";
import { createSession } from "../sessions/[id]/actions";
import { createClient, getUserId } from "@/lib/supabase/server/server";

export default async function NewSessionPage() {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    redirect("/auth/login");
  }

  // Create a new draft session with default values
  const result = await createSession({
    title: "New Session",
    sport: "badminton",
    start_at: new Date().toISOString(),
    status: "draft",
  });

  if (result.error) {
    // Handle error - for now redirect to dashboard
    redirect("/dashboard");
  }

  if (result.data) {
    redirect(`/host/sessions/${result.data.id}/edit`);
  }

  redirect("/dashboard");
}

