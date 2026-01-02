import { createClient } from "@/lib/supabase/server/server"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { PublicSessionView } from "@/components/session/public-session-view"
import { getUser } from "@/lib/supabase/server/server"

// Force dynamic rendering to always fetch latest data
export const dynamic = "force-dynamic"

async function PublicSessionContent({ sessionId }: { sessionId: string }) {
  const supabase = await createClient()

  // Check if user is authenticated and if they are the host
  const user = await getUser(supabase)
  
  // Fetch session data (RLS will allow access if user is host OR if session is open)
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (sessionError || !session) {
    // Log error details for debugging
    const errorInfo = sessionError ? {
      message: sessionError.message,
      details: sessionError.details,
      hint: sessionError.hint,
      code: sessionError.code,
    } : null
    console.error(`[PublicSessionPage] Error fetching session (${sessionId}):`, errorInfo)
    notFound()
  }

  // If user is authenticated and is the host, redirect to analytics page
  if (user && session.host_id === user.id) {
    redirect(`/host/sessions/${sessionId}/edit`)
  }

  // Only show open sessions to public (non-host users)
  if (session.status !== "open") {
    notFound()
  }

  // Fetch participants (confirmed for going list, waitlisted for waitlist)
  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id, display_name, status")
    .eq("session_id", sessionId)
    .in("status", ["confirmed", "waitlisted"])
    .order("created_at", { ascending: true })

  if (participantsError) {
    console.error(`[PublicSessionPage] Error fetching participants:`, participantsError)
  }

  // Separate confirmed and waitlisted
  const confirmedParticipants = (participants || []).filter(p => p.status === "confirmed")
  const waitlistParticipants = (participants || []).filter(p => p.status === "waitlisted")

  // Fetch host profile for avatar
  const { data: hostProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", session.host_id)
    .single()

  return (
    <PublicSessionView
      session={session}
      participants={confirmedParticipants}
      waitlist={waitlistParticipants}
      hostAvatarUrl={hostProfile?.avatar_url || null}
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

