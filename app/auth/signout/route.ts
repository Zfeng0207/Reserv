import { createClient } from '@/lib/supabase/server/server'
import { NextResponse } from 'next/server'
import { logInfo, logError } from '@/lib/logger'

/**
 * Sign out route - clears Supabase session
 * 
 * Redirects to /home after sign out
 */
export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  logInfo("auth_signout_start", { origin })

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

  // Always redirect to home after signout attempt
  return NextResponse.redirect(`${origin}/home`)
}




