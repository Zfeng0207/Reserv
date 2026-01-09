/**
 * Guest identity key utility
 * 
 * IMPORTANT: guest_key is NOT identity - it's a write-only identifier for tracking.
 * Identity is determined by profile_id (sessionId + normalizedName) for guests.
 * 
 * We generate a NEW guest_key per guest join to prevent replacement bugs.
 * The old approach of reusing guest_key caused issues when:
 * - User signs out and joins as guest (reused key)
 * - Multiple guests join from same browser (reused key)
 */

const GUEST_KEY_STORAGE_KEY = "reserv_guest_key"

/**
 * Generate a NEW guest key (always creates a new UUID)
 * Use this when starting a new guest join to prevent identity confusion
 * 
 * This ensures each guest join gets a unique key, preventing replacement bugs
 */
export function generateNewGuestKey(): string {
  if (typeof window === "undefined") {
    throw new Error("generateNewGuestKey() should only be called on the client")
  }

  const newKey = crypto.randomUUID()
  localStorage.setItem(GUEST_KEY_STORAGE_KEY, newKey)
  return newKey
}

/**
 * Get or create a guest key for this device
 * 
 * NOTE: This is for backward compatibility. For new guest joins,
 * use generateNewGuestKey() to ensure a fresh key.
 */
export function getOrCreateGuestKey(): string {
  if (typeof window === "undefined") {
    throw new Error("getOrCreateGuestKey() should only be called on the client")
  }

  // Try to get existing key
  const existing = localStorage.getItem(GUEST_KEY_STORAGE_KEY)
  if (existing) {
    return existing
  }

  // Generate new UUID
  return generateNewGuestKey()
}

/**
 * Get the current guest key (returns null if not set)
 * Use this when you want to check if a key exists without creating one
 */
export function getGuestKey(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem(GUEST_KEY_STORAGE_KEY)
}

/**
 * Clear the guest key (used during identity reset)
 */
export function clearGuestKey(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(GUEST_KEY_STORAGE_KEY)
}

