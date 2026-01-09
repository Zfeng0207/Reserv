/**
 * Identity Scope Management
 * 
 * Tracks the current identity that the browser represents.
 * This is separate from participant records - it's about "who am I right now?"
 * 
 * Identity types:
 * - "auth": Authenticated user (identified by userId)
 * - "guest": Guest user (identified by profileId = sessionId + normalizedName)
 * - null: No active identity (signed out, no guest)
 */

export type IdentityType = "auth" | "guest" | null

export interface IdentityScope {
  type: IdentityType
  id: string | null // userId for auth, profileId for guest
  sessionId?: string // Only for guest identity
  guestName?: string // Only for guest identity
}

const IDENTITY_SCOPE_KEY = "reserv_current_identity"

/**
 * Get current identity scope from localStorage
 */
export function getCurrentIdentityScope(): IdentityScope | null {
  if (typeof window === "undefined") return null
  
  try {
    const stored = localStorage.getItem(IDENTITY_SCOPE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as IdentityScope
  } catch {
    return null
  }
}

/**
 * Set current identity scope
 */
export function setCurrentIdentityScope(scope: IdentityScope | null): void {
  if (typeof window === "undefined") return
  
  if (scope === null) {
    localStorage.removeItem(IDENTITY_SCOPE_KEY)
  } else {
    localStorage.setItem(IDENTITY_SCOPE_KEY, JSON.stringify(scope))
  }
}

/**
 * Hard reset: Clear all identity-related browser state
 * This must be called on ANY identity change:
 * - Sign out
 * - Sign in
 * - New guest join
 */
export function resetIdentityScope(publicCode?: string): void {
  if (typeof window === "undefined") return
  
  // Clear identity scope
  localStorage.removeItem(IDENTITY_SCOPE_KEY)
  
  // Clear guest key (will be regenerated on next guest join)
  localStorage.removeItem("reserv_guest_key")
  
  // Clear stored participant info for this session
  if (publicCode) {
    localStorage.removeItem(`reserv_rsvp_${publicCode}`)
  }
  
  // Clear all session-specific participant info
  // (in case publicCode is not available)
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith("reserv_rsvp_")) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key))
}

/**
 * Set identity scope for authenticated user
 */
export function setAuthIdentityScope(userId: string): void {
  setCurrentIdentityScope({
    type: "auth",
    id: userId,
  })
}

/**
 * Set identity scope for guest user
 */
export function setGuestIdentityScope(profileId: string, sessionId: string, guestName: string): void {
  setCurrentIdentityScope({
    type: "guest",
    id: profileId,
    sessionId,
    guestName,
  })
}

/**
 * Check if current identity scope matches participant
 * 
 * For auth: participant.contact_email must match current auth user's email
 * For guest: participant.profile_id must match current guest's profileId
 */
export function doesParticipantMatchIdentityScope(
  participant: { contact_email?: string | null; profile_id?: string | null },
  currentScope: IdentityScope | null,
  currentUserEmail?: string | null
): boolean {
  if (!currentScope) return false
  
  if (currentScope.type === "auth") {
    // Auth user: must match by email
    return participant.contact_email === currentUserEmail
  } else if (currentScope.type === "guest") {
    // Guest: must match by profile_id
    return participant.profile_id === currentScope.id
  }
  
  return false
}

