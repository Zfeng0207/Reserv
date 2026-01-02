/**
 * Guest identity key utility
 * Generates and persists a stable device key for anonymous participants
 * This key persists across sessions and reloads, allowing the app to recognize
 * the same guest user on return visits.
 */

const GUEST_KEY_STORAGE_KEY = "reserv_guest_key"

/**
 * Get or create a stable guest key for this device
 * If no key exists, generates a new UUID and stores it in localStorage
 * Returns the same key on subsequent calls
 */
export function getOrCreateGuestKey(): string {
  if (typeof window === "undefined") {
    // Server-side: return a placeholder (shouldn't be used on server)
    throw new Error("getOrCreateGuestKey() should only be called on the client")
  }

  // Try to get existing key
  const existing = localStorage.getItem(GUEST_KEY_STORAGE_KEY)
  if (existing) {
    return existing
  }

  // Generate new UUID
  const newKey = crypto.randomUUID()
  localStorage.setItem(GUEST_KEY_STORAGE_KEY, newKey)
  return newKey
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

