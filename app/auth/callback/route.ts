import { createClient } from '@/lib/supabase/server/server'
import { NextResponse } from 'next/server'
import { getPostAuthRedirectFromCookie } from '@/lib/post-auth-redirect'
import { log, logInfo, logError, logWarn } from '@/lib/logger'

/**
 * Auth callback route - handles OAuth redirects and code exchange
 * 
 * Query params:
 * - code: OAuth code from Supabase
 * - redirectTo: Where to redirect after successful auth (validated)
 * 
 * Priority for redirect target:
 * 1. redirectTo query param (if valid and same origin)
 * 2. postAuthRedirect cookie
 * 3. Default to /home
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectToQuery = requestUrl.searchParams.get('redirectTo')
  const nextParam = requestUrl.searchParams.get('next') // Alternative param name
  const origin = requestUrl.origin
  const cookies = request.headers.get('cookie') || ''

  logInfo("auth_callback_start", {
    hasCode: !!code,
    redirectToQuery,
    nextParam,
    origin,
    hasCookie: cookies.includes('postAuthRedirect'),
  })

  // Determine redirect target (priority: redirectTo query > next query > cookie > home)
  let redirectTarget = '/home' // Default to home instead of root

  // Try redirectTo query param first
  if (redirectToQuery) {
    try {
      const url = new URL(redirectToQuery, origin)
      if (url.origin === origin) {
        redirectTarget = url.pathname + url.search + url.hash
        logInfo("auth_callback_redirect_from_query", { redirectTarget })
      } else {
        logWarn("auth_callback_invalid_redirect_origin", { redirectToQuery, origin: url.origin })
      }
    } catch (e) {
      logWarn("auth_callback_invalid_redirect_query", { redirectToQuery, error: String(e) })
    }
  }

  // Fallback to next param
  if (redirectTarget === '/home' && nextParam) {
    try {
      const url = new URL(nextParam, origin)
      if (url.origin === origin) {
        redirectTarget = url.pathname + url.search + url.hash
        logInfo("auth_callback_redirect_from_next", { redirectTarget })
      }
    } catch (e) {
      logWarn("auth_callback_invalid_next_param", { nextParam, error: String(e) })
    }
  }

  // Fallback to cookie if no query param
  if (redirectTarget === '/home') {
    const cookieRedirect = getPostAuthRedirectFromCookie(cookies, '/home')
    if (cookieRedirect !== '/home') {
      redirectTarget = cookieRedirect
      logInfo("auth_callback_redirect_from_cookie", { redirectTarget })
    }
  }

  // Validate redirect target (prevent redirect loops and auth paths)
  if (redirectTarget.startsWith('/auth') || redirectTarget === '/') {
    redirectTarget = '/home'
    logWarn("auth_callback_redirect_sanitized", { original: redirectTarget, sanitized: '/home' })
  }

  if (!code) {
    logWarn("auth_callback_no_code", { redirectTarget })
    return NextResponse.redirect(`${origin}${redirectTarget}?error=no_code`)
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      logError("auth_callback_exchange_failed", { 
        error: error.message,
        code: error.status,
        redirectTarget 
      })
      return NextResponse.redirect(`${origin}${redirectTarget}?error=auth_failed`)
    }

    if (!data.session) {
      logError("auth_callback_no_session", { redirectTarget })
      return NextResponse.redirect(`${origin}${redirectTarget}?error=no_session`)
    }

    logInfo("auth_callback_success", { 
      redirectTarget,
      userId: data.session.user?.id,
      email: data.session.user?.email,
    })
    
    // Successful authentication - redirect to the stored page
    return NextResponse.redirect(`${origin}${redirectTarget}`)
  } catch (error: any) {
    logError("auth_callback_exception", { 
      error: error?.message,
      stack: error?.stack,
      redirectTarget 
    })
    return NextResponse.redirect(`${origin}${redirectTarget}?error=exception`)
  }
}

