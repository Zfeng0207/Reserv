"use client"

import { SessionInvite } from "@/components/session-invite"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function HostSessionNewContent() {
  const searchParams = useSearchParams()
  const isPreviewMode = searchParams.get("mode") === "preview"

  return (
    <main className="min-h-screen sporty-bg">
      <SessionInvite initialEditMode={true} initialPreviewMode={isPreviewMode} />
    </main>
  )
}

export default function HostSessionNewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostSessionNewContent />
    </Suspense>
  )
}

