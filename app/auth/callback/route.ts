import { createClient } from '@/lib/supabase/server/server'
import { NextResponse } from 'next/server'
import { getPostAuthRedirectFromCookie } from '@/lib/post-auth-redirect'
import { log } from '@/lib/logger'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectToQuery = requestUrl.searchParams.get('redirectTo')
  const origin = requestUrl.origin
  const cookies = request.headers.get('cookie') || ''

  // Determine redirect target (priority: query param > cookie > sessionStorage > home)
  let redirectTarget = '/'

  if (redirectToQuery) {
    // Validate redirectTo query param (prevent open redirect)
    try {
      const url = new URL(redirectToQuery, origin)
      if (url.origin === origin) {
        redirectTarget = url.pathname + url.search + url.hash
      }
    } catch (e) {
      log("warn", "auth_callback_invalid_redirect_query", { redirectToQuery, error: String(e) })
    }
  }

  // Fallback to cookie if no query param
  if (redirectTarget === '/') {
    redirectTarget = getPostAuthRedirectFromCookie(cookies, '/')
  }

  log("info", "auth_callback_start", {
    hasCode: !!code,
    redirectToQuery,
    redirectTarget,
    hasCookie: cookies.includes('postAuthRedirect'),
  })

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      log("info", "auth_callback_success", { redirectTarget })
      // Successful authentication - redirect to the stored page
      return NextResponse.redirect(`${origin}${redirectTarget}`)
    } else {
      log("error", "auth_callback_exchange_failed", { error: error.message })
    }
  }

  // If there's an error or no code, redirect to home with error
  log("warn", "auth_callback_failed", { redirectTarget })
  return NextResponse.redirect(`${origin}${redirectTarget}?error=auth_failed`)
}

