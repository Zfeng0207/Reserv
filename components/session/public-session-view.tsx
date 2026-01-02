"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SessionInvite } from "@/components/session-invite"
import { GuestRSVPDialog } from "./guest-rsvp-dialog"
import { joinSession, declineSession, getParticipantRSVPStatus } from "@/app/session/[id]/actions"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getOrCreateGuestKey, getGuestKey } from "@/lib/guest-key"

interface Participant {
  id: string
  display_name: string
}

interface Session {
  id: string
  title: string
  description: string | null
  location: string | null
  cover_url: string | null
  sport: "badminton" | "pickleball" | "volleyball" | "other"
  host_name: string | null
  capacity: number | null
  start_at: string
  end_at: string | null
  court_numbers?: string | null
  container_overlay_enabled?: boolean | null
  // Add price if it exists in the schema
  // price?: number | null
}

interface PublicSessionViewProps {
  session: Session
  participants: Participant[]
  waitlist?: Participant[]
}

// Format timestamp to display format
function formatSessionDate(startAt: string, endAt: string | null): string {
  try {
    const start = parseISO(startAt)
    const end = endAt ? parseISO(endAt) : null

    const dayName = format(start, "EEE")
    const monthName = format(start, "MMM")
    const day = format(start, "d")
    const startTime = format(start, "h:mm a")
    const endTime = end ? format(end, "h:mm a") : null

    if (endTime) {
      return `${dayName}, ${monthName} ${day} • ${startTime} - ${endTime}`
    }
    return `${dayName}, ${monthName} ${day} • ${startTime}`
  } catch {
    return "Date TBD"
  }
}

// Map sport enum to display name
function getSportDisplayName(sport: string): string {
  const map: Record<string, string> = {
    badminton: "Badminton",
    pickleball: "Pickleball",
    volleyball: "Volleyball",
    other: "Other",
  }
  return map[sport] || sport
}

function PublicSessionViewContent({ session, participants, waitlist = [] }: PublicSessionViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false)
  const [rsvpAction, setRsvpAction] = useState<"join" | "decline">("join")
  const [uiMode, setUiMode] = useState<"dark" | "light">("dark")
  const [rsvpState, setRsvpState] = useState<"none" | "joined" | "declined" | "waitlisted">("none")
  const [storedParticipantInfo, setStoredParticipantInfo] = useState<{ name: string; phone: string | null } | null>(null)
  const [guestKey, setGuestKey] = useState<string | null>(null)
  
  // Check if user came from analytics page
  const fromAnalytics = searchParams.get("from") === "analytics"
  
  // Get public_code from session
  const publicCode = (session as any).public_code

  // Initialize guest key on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = getOrCreateGuestKey()
      setGuestKey(key)
    }
  }, [])

  // Load participant RSVP status on mount using guest_key
  useEffect(() => {
    if (!publicCode || !guestKey) return

    const loadRSVPStatus = async () => {
      try {
        const result = await getParticipantRSVPStatus(publicCode, guestKey)
        if (result.ok) {
          if (result.status === "confirmed") {
            setRsvpState("joined")
            if (result.displayName) {
              setStoredParticipantInfo({ name: result.displayName, phone: null })
            }
          } else if (result.status === "cancelled") {
            setRsvpState("declined")
            if (result.displayName) {
              setStoredParticipantInfo({ name: result.displayName, phone: null })
            }
          } else if (result.status === "waitlisted") {
            setRsvpState("waitlisted")
            if (result.displayName) {
              setStoredParticipantInfo({ name: result.displayName, phone: null })
            }
          } else {
            setRsvpState("none")
          }
        }
      } catch (error) {
        console.error("[PublicSessionView] Error loading RSVP status:", error)
      }
    }

    loadRSVPStatus()
  }, [publicCode, guestKey])

  // Hydrate uiMode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("reserv-ui-mode")
      if (saved === "light" || saved === "dark") {
        setUiMode(saved)
      }
    }
  }, [])

  // Persist uiMode
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("reserv-ui-mode", uiMode)
    }
  }, [uiMode])

  const formattedDate = formatSessionDate(session.start_at, session.end_at)
  const sportDisplayName = getSportDisplayName(session.sport)

  // Convert participants to demo format for SessionInvite
  const demoParticipants = participants.map((p) => ({
    name: p.display_name,
    avatar: null,
  }))

  // Sync UI mode from SessionInvite if needed (it manages its own state)
  // We'll keep this component's state for the dialog styling

  const handleRSVPContinue = async (name: string, phone: string | null, action?: "join" | "decline") => {
    try {
      if (!publicCode) {
        toast({
          title: "Error",
          description: "Session is not published.",
          variant: "destructive",
        })
        return
      }

      // Store participant info in localStorage
      const storageKey = `reserv_rsvp_${publicCode}`
      localStorage.setItem(storageKey, JSON.stringify({ name, phone }))
      setStoredParticipantInfo({ name, phone })

      if (!guestKey) {
        toast({
          title: "Error",
          description: "Unable to identify device. Please refresh the page.",
          variant: "destructive",
        })
        return
      }

      const isUpdating = rsvpState !== "none"
      const actionToUse = action || rsvpAction
      let result
      if (actionToUse === "join") {
        result = await joinSession(publicCode, name, guestKey, phone)
        if (result.ok) {
          setRsvpState("joined")
          toast({
            title: isUpdating ? "Updated your RSVP" : "You're in!",
            description: isUpdating ? "You've joined this session." : "You've successfully joined this session.",
            variant: "success",
          })
          // Refresh the page to show updated participant list
          router.refresh()
        } else {
          if (result.code === "CAPACITY_EXCEEDED") {
            toast({
              title: "Session is full",
              description: result.error,
              variant: "destructive",
            })
          } else {
            toast({
              title: "Failed to join",
              description: result.error,
              variant: "destructive",
            })
          }
        }
      } else {
        result = await declineSession(publicCode, name, guestKey, phone)
        if (result.ok) {
          setRsvpState("declined")
          toast({
            title: isUpdating ? "Updated your RSVP" : "Declined",
            description: isUpdating ? "You've declined this session." : "You've declined this session invitation.",
            variant: "success",
          })
          router.refresh()
        } else {
          toast({
            title: "Failed to decline",
            description: result.error,
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle RSVP click - if already RSVP'd, switch action to opposite
  const handleRSVPClick = (action: "join" | "decline") => {
    // If user has already RSVP'd and clicking the same action, do nothing
    if (rsvpState === "joined" && action === "join") return
    if (rsvpState === "declined" && action === "decline") return

    // If user already RSVP'd, use stored info (no need for dialog - directly update)
    if (storedParticipantInfo && rsvpState !== "none") {
      handleRSVPContinue(storedParticipantInfo.name, storedParticipantInfo.phone, action)
      return
    }

    // First time RSVP - show dialog
    setRsvpAction(action)
    setRsvpDialogOpen(true)
  }

  const handleBackToAnalytics = () => {
    router.push(`/host/sessions/${session.id}/edit`)
  }

  return (
    <>
      {/* Back to Analytics Button - only show if from analytics */}
      {fromAnalytics && (
        <div className="fixed top-16 left-4 z-50">
          <Button
            onClick={handleBackToAnalytics}
            variant="outline"
            className={cn(
              "rounded-full h-10 px-4 gap-2 backdrop-blur-xl border shadow-lg",
              uiMode === "dark"
                ? "bg-black/40 border-white/20 text-white hover:bg-black/60"
                : "bg-white/80 border-black/20 text-black hover:bg-white"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to analytics</span>
          </Button>
        </div>
      )}

      <SessionInvite
        sessionId={session.id}
        initialCoverUrl={session.cover_url}
        initialSport={sportDisplayName}
        initialEditMode={false}
        initialPreviewMode={true}
        hidePreviewBanner={true} // Hide preview banner for public view
        initialTitle={session.title}
        initialDate={formattedDate}
        initialLocation={session.location || null}
        initialCapacity={session.capacity || null}
        initialCourt={session.court_numbers || null}
        initialContainerOverlayEnabled={session.container_overlay_enabled ?? true}
        initialHostName={session.host_name || null}
        initialDescription={session.description || null}
        demoMode={false}
        demoParticipants={demoParticipants}
        onJoinClick={() => handleRSVPClick("join")}
        onDeclineClick={() => handleRSVPClick("decline")}
        rsvpState={rsvpState}
        waitlist={waitlist}
      />

      {/* RSVP Dialog */}
      <GuestRSVPDialog
        open={rsvpDialogOpen}
        onOpenChange={setRsvpDialogOpen}
        onContinue={handleRSVPContinue}
        uiMode={uiMode}
        action={rsvpAction}
      />
    </>
  )
}

export function PublicSessionView({ session, participants }: PublicSessionViewProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublicSessionViewContent session={session} participants={participants} />
    </Suspense>
  )
}

