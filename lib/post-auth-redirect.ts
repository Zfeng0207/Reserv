/**
 * Post-auth redirect utility
 * 
 * Stores the URL to redirect to after authentication completes.
 * Uses sessionStorage (primary) and cookie (fallback for Safari/mobile).
 */

const STORAGE_KEY = "postAuthRedirect"
const COOKIE_NAME = "postAuthRedirect"
const COOKIE_MAX_AGE = 600 // 10 minutes

/**
 * Get the current page URL (path + query + hash)
 */
export function getCurrentReturnTo(): string {
  if (typeof window === "undefined") return "/"
  
  return window.location.pathname + window.location.search + window.location.hash
}

/**
 * Store the redirect URL in both sessionStorage and cookie
 */
export function setPostAuthRedirect(returnTo: string): void {
  if (typeof window === "undefined") return

  // Store in sessionStorage (primary)
  try {
    sessionStorage.setItem(STORAGE_KEY, returnTo)
  } catch (e) {
    console.warn("[post-auth-redirect] Failed to set sessionStorage:", e)
  }

  // Store in cookie (fallback for Safari/mobile)
  try {
    const expires = new Date(Date.now() + COOKIE_MAX_AGE * 1000).toUTCString()
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(returnTo)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}; expires=${expires}`
  } catch (e) {
    console.warn("[post-auth-redirect] Failed to set cookie:", e)
  }
}

/**
 * Read and clear the stored redirect URL
 * Returns the stored URL or fallback if not found
 */
export function consumePostAuthRedirect(fallback: string = "/"): string {
  if (typeof window === "undefined") return fallback

  let redirectTo = fallback

  // Try sessionStorage first
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      redirectTo = stored
      sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch (e) {
    console.warn("[post-auth-redirect] Failed to read sessionStorage:", e)
  }

  // Fallback to cookie if sessionStorage didn't have it
  if (redirectTo === fallback) {
    try {
      const cookies = document.cookie.split(";")
      const cookie = cookies.find((c) => c.trim().startsWith(`${COOKIE_NAME}=`))
      if (cookie) {
        const value = cookie.split("=")[1]
        redirectTo = decodeURIComponent(value)
        // Clear cookie
        document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      }
    } catch (e) {
      console.warn("[post-auth-redirect] Failed to read cookie:", e)
    }
  }

  // Validate the redirect URL (prevent open redirect)
  try {
    const url = new URL(redirectTo, window.location.origin)
    // Only allow same-origin redirects
    if (url.origin !== window.location.origin) {
      console.warn("[post-auth-redirect] Invalid redirect origin, using fallback")
      return fallback
    }
    return url.pathname + url.search + url.hash
  } catch (e) {
    // If URL parsing fails, return fallback
    console.warn("[post-auth-redirect] Invalid redirect URL, using fallback:", e)
    return fallback
  }
}

/**
 * Server-side version: read from cookie only
 */
export function getPostAuthRedirectFromCookie(cookies: string, fallback: string = "/"): string {
  try {
    const cookiePairs = cookies.split(";")
    const cookie = cookiePairs.find((c) => c.trim().startsWith(`${COOKIE_NAME}=`))
    if (cookie) {
      const value = cookie.split("=")[1]
      const decoded = decodeURIComponent(value)
      // Basic validation - ensure it's a path, not a full URL
      if (decoded.startsWith("/") || decoded === "/") {
        return decoded
      }
    }
  } catch (e) {
    console.warn("[post-auth-redirect] Failed to read cookie on server:", e)
  }
  return fallback
}

