/**
 * Utility functions for guest user management
 */

/**
 * Get the guest name from localStorage
 */
export function getGuestName(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("guestName")
}

/**
 * Set the guest name in localStorage
 */
export function setGuestName(name: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("guestName", name)
}

/**
 * Remove the guest name from localStorage
 */
export function clearGuestName(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("guestName")
}

