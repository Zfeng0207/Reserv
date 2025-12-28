"use client"

import { SessionInvite } from "@/components/session-invite"

export default function SharedSessionPage() {
  // For shared/public view, show in preview mode only (not edit mode)
  return (
    <main className="min-h-screen sporty-bg">
      <SessionInvite initialEditMode={false} initialPreviewMode={true} />
    </main>
  )
}
