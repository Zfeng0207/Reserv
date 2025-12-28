"use client"

import { SessionInvite } from "@/components/session-invite"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function HostSessionEditContent() {
  const searchParams = useSearchParams()
  const isPreviewMode = searchParams.get("mode") === "preview"

  return (
    <main className="min-h-screen sporty-bg">
      <SessionInvite initialEditMode={true} initialPreviewMode={isPreviewMode} />
    </main>
  )
}

export default function HostSessionEditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostSessionEditContent />
    </Suspense>
  )
}
