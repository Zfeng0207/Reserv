import { createClient } from '@/lib/supabase/server/server'
import { NextResponse } from 'next/server'
import { logInfo, logError } from '@/lib/logger'

/**
 * Sign out route - clears Supabase session
 * 
 * Redirects to referer or root path (never /home)
 */
export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const referer = request.headers.get('referer')

  logInfo("auth_signout_start", { origin, referer })

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      logError("auth_signout_failed", { error: error.message })
      // Still redirect even if signout fails (client will clear local state)
    } else {
      logInfo("auth_signout_success", {})
    }
  } catch (error: any) {
    logError("auth_signout_exception", { 
      error: error?.message,
      stack: error?.stack,
    })
  }

  // Determine redirect target: use referer if valid, otherwise root
  let redirectTarget = '/'
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      if (refererUrl.origin === origin && !refererUrl.pathname.startsWith('/auth')) {
        redirectTarget = refererUrl.pathname + refererUrl.search + refererUrl.hash
        logInfo("auth_signout_redirect_to_referer", { redirectTarget })
      } else {
        logInfo("auth_signout_redirect_to_root", {})
      }
    } catch (e) {
      logInfo("auth_signout_redirect_to_root", {})
    }
  } else {
    logInfo("auth_signout_redirect_to_root", {})
  }

  return NextResponse.redirect(`${origin}${redirectTarget}`)
}




