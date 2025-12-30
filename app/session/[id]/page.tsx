import { createClient } from "@/lib/supabase/server/server"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { PublicSessionView } from "@/components/session/public-session-view"

// Force dynamic rendering to always fetch latest data
export const dynamic = "force-dynamic"

async function PublicSessionContent({ sessionId }: { sessionId: string }) {
  const supabase = await createClient()

  // Fetch session (public read)
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (sessionError) {
    // Log error details for debugging
    const errorInfo = {
      message: sessionError.message,
      details: sessionError.details,
      hint: sessionError.hint,
      code: sessionError.code,
    }
    console.error(`[PublicSessionPage] Error fetching session (${sessionId}):`, errorInfo)
    notFound()
  }

  if (!session) {
    console.error(`[PublicSessionPage] Session not found:`, { sessionId })
    notFound()
  }

  // Only show open sessions to public
  if (session.status !== "open") {
    notFound()
  }

  // Fetch participants (only "confirmed" status for public view)
  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id, display_name")
    .eq("session_id", sessionId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: true })

  if (participantsError) {
    console.error(`[PublicSessionPage] Error fetching participants:`, participantsError)
  }

  return (
    <PublicSessionView
      session={session}
      participants={participants || []}
    />
  )
}

export default async function PublicSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: sessionId } = await params

  return (
    <main className="min-h-screen sporty-bg">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <PublicSessionContent sessionId={sessionId} />
      </Suspense>
    </main>
  )
}

