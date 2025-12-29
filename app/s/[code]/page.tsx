import { SessionInvite } from "@/components/session-invite"
import { createClient } from "@/lib/supabase/server/server"
import { notFound } from "next/navigation"

// Force dynamic rendering to always fetch latest cover
export const dynamic = "force-dynamic"

export default async function SharedSessionPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code: sessionId } = await params
  const supabase = await createClient()

  // Fetch session (public read)
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (sessionError || !session) {
    console.error(`[SharedSessionPage] Error fetching session:`, sessionError)
    notFound()
  }

  // Only show open sessions to public
  if (session.status !== "open") {
    notFound()
  }

  console.log(`[SharedSessionPage] Session fetched:`, { 
    sessionId, 
    cover_url: session.cover_url,
    hasCoverUrl: !!session.cover_url 
  })

  // For shared/public view, show in preview mode only (not edit mode)
  return (
    <main className="min-h-screen sporty-bg">
      <SessionInvite
        sessionId={sessionId}
        initialCoverUrl={session.cover_url || null}
        initialSport={session.sport || null}
        initialEditMode={false}
        initialPreviewMode={true}
      />
    </main>
  )
}
