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
    hasCoverUrl: !!session.cover_url,
    status: session.status,
    public_code: session.public_code
  })

  // Determine if session is published
  const isPublished = session.status === "open" && !!session.public_code

  return (
    <SessionInvite
      sessionId={sessionId}
      initialCoverUrl={session.cover_url || null}
      initialSport={session.sport || null}
      initialEditMode={!isPublished} // If published, start in analytics view (edit mode = false)
      initialPreviewMode={isPreviewMode && !isPublished} // Only preview if not published
      initialTitle={session.title || null}
      initialDate={null} // TODO: Format from session.start_at if needed
      initialLocation={session.location || null}
      initialPrice={(session as any).price || null} // Type assertion since price might exist but not in types
      initialCapacity={session.capacity || null}
      initialHostName={session.host_name || null}
      initialDescription={session.description || null}
      initialIsPublished={isPublished} // Pass published status
    />
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
    <main className="min-h-screen sporty-bg">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <HostSessionEditContent sessionId={sessionId} isPreviewMode={isPreviewMode} />
      </Suspense>
    </main>
  )
}
