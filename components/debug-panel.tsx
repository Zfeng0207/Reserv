"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { debugEnabled } from "@/lib/logger"
import { cn } from "@/lib/utils"

interface DebugPanelProps {
  publicCode?: string | null
  hostSlug?: string | null
  sessionId?: string | null
  userId?: string | null
  guestKey?: string | null
  lastTraceId?: string | null
  lastJoinError?: string | null
}

export function DebugPanel({
  publicCode,
  hostSlug,
  sessionId,
  userId,
  guestKey,
  lastTraceId,
  lastJoinError,
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  if (!debugEnabled()) {
    return null
  }

  const debugData = {
    publicCode: publicCode || "N/A",
    hostSlug: hostSlug || "N/A",
    sessionId: sessionId || "N/A",
    userId: userId || "N/A",
    guestKey: guestKey || "N/A",
    lastTraceId: lastTraceId || "N/A",
    lastJoinError: lastJoinError || "None",
    apiBaseUrl: typeof window !== "undefined" ? window.location.origin : "N/A",
    supabaseHost: process.env.NEXT_PUBLIC_SUPABASE_URL 
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname 
      : "N/A",
  }

  const copyToClipboard = (text: string, key: string) => {
    if (typeof window === "undefined") return
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[280px] bg-slate-900/95 border-white/10 backdrop-blur-xl z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-white/80 hover:text-white transition-colors"
      >
        <span className="text-xs font-medium">Debug Panel</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="p-3 space-y-2 border-t border-white/10">
          {Object.entries(debugData).map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white/50 uppercase tracking-wide mb-0.5">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </div>
                <div className="text-xs text-white/80 font-mono break-all">
                  {value}
                </div>
              </div>
              {value !== "N/A" && value !== "None" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white/60 hover:text-white/80 flex-shrink-0"
                  onClick={() => copyToClipboard(String(value), key)}
                >
                  {copied === key ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

