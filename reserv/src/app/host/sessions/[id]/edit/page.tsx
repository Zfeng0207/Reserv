import { notFound, redirect } from "next/navigation";
import { createClient, getUserId } from "@/lib/supabase/server/server";
import { HostSessionEdit } from "../host-session-edit";

export default async function HostSessionEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    redirect("/auth/login");
  }

  // Fetch session with host verification
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .eq("host_id", userId)
    .single();

  if (error || !session) {
    notFound();
  }

  const isPreviewMode = mode === "preview";

  return <HostSessionEdit session={session} initialPreviewMode={isPreviewMode} />;
}

