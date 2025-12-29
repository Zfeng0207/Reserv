import { SessionInvite } from "@/components/session-invite"
import { createClient, getUserId } from "@/lib/supabase/server/server"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"

// Force dynamic rendering to always fetch latest data
export const dynamic = "force-dynamic"

async function HostSessionEditContent({
  sessionId,
  isPreviewMode,
}: {
  sessionId: string
  isPreviewMode: boolean
}) {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    redirect("/auth/login")
  }

  // Fetch session with host verification
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("host_id", userId)
    .single()

  if (error || !session) {
    console.error(`[HostSessionEditContent] Error fetching session:`, error)
    notFound()
  }

  console.log(`[HostSessionEditContent] Session fetched:`, { 
    sessionId, 
    cover_url: session.cover_url,
    hasCoverUrl: !!session.cover_url 
  })

  return (
    <main className="min-h-screen sporty-bg">
      <SessionInvite
        sessionId={sessionId}
        initialCoverUrl={session.cover_url || null}
        initialSport={session.sport || null}
        initialEditMode={true}
        initialPreviewMode={isPreviewMode}
      />
    </main>
  )
}

export default async function HostSessionEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { id: sessionId } = await params
  const { mode } = await searchParams
  const isPreviewMode = mode === "preview"

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostSessionEditContent sessionId={sessionId} isPreviewMode={isPreviewMode} />
    </Suspense>
  )
}
