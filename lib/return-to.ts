/**
 * Return-to utility for post-auth redirects
 * 
 * Stores the current URL before authentication so users can return to their
 * last visited page after login completes.
 * Uses sessionStorage (per-tab, cleared on close).
 */

const STORAGE_KEY = "reserv:returnTo"

/**
 * Get the current page URL (path + query + hash)
 */
export function getCurrentUrl(): string {
  if (typeof window === "undefined") return "/"
  return window.location.pathname + window.location.search + window.location.hash
}

/**
 * Store the return URL in sessionStorage
 */
export function setReturnTo(url: string): void {
  if (typeof window === "undefined") return

  try {
    sessionStorage.setItem(STORAGE_KEY, url)
    console.log("[auth] setReturnTo", { url })
  } catch (e) {
    console.warn("[return-to] Failed to set sessionStorage:", e)
  }
}

/**
 * Get the stored return URL
 */
export function getReturnTo(): string | null {
  if (typeof window === "undefined") return null

  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch (e) {
    console.warn("[return-to] Failed to read sessionStorage:", e)
    return null
  }
}

/**
 * Clear the stored return URL
 */
export function clearReturnTo(): void {
  if (typeof window === "undefined") return

  try {
    sessionStorage.removeItem(STORAGE_KEY)
    console.log("[auth] clearReturnTo")
  } catch (e) {
    console.warn("[return-to] Failed to clear sessionStorage:", e)
  }
}

/**
 * Validate and consume the return URL
 * Returns the URL if valid, or fallback if invalid/missing
 */
export function consumeReturnTo(fallback: string = "/"): string {
  if (typeof window === "undefined") return fallback

  const returnTo = getReturnTo()
  clearReturnTo()

  if (!returnTo) {
    console.log("[auth] no returnTo, using fallback", { fallback })
    return fallback
  }

  // Guard against redirect loops and invalid paths
  if (returnTo.startsWith("/auth") || returnTo === window.location.pathname) {
    console.warn("[auth] invalid returnTo (loop prevention)", { returnTo })
    return fallback
  }

  // Validate it's a same-origin path
  try {
    const url = new URL(returnTo, window.location.origin)
    if (url.origin !== window.location.origin) {
      console.warn("[auth] invalid returnTo (cross-origin)", { returnTo })
      return fallback
    }
    const finalPath = url.pathname + url.search + url.hash
    console.log("[auth] consumeReturnTo", { returnTo: finalPath })
    return finalPath
  } catch (e) {
    console.warn("[auth] invalid returnTo (parse error)", { returnTo, error: String(e) })
    return fallback
  }
}

