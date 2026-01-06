/**
 * Supabase Auth utilities (Native Supabase Auth - NO proxy)
 * 
 * Configure these environment variables in your .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 * - NEXT_PUBLIC_SITE_URL: Site URL (optional, defaults to window.location.origin)
 */

import { createClient } from './supabase/client'

/**
 * Get the site URL for redirects (supports Vercel and custom domains)
 */
function getSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export const handleGoogleOAuth = async (returnTo?: string) => {
  if (typeof window === 'undefined') {
    console.error('[AUTH] handleGoogleOAuth called on server')
    return
  }

  const supabase = createClient()
  
  // Get returnTo from parameter or current page
  const redirectTo = returnTo || (window.location.pathname + window.location.search + window.location.hash)
  const siteUrl = getSiteUrl()
  
  // Build callback URL with redirectTo query param
  const callbackUrl = `${siteUrl}/auth/callback${redirectTo && redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`
  
  console.log('[AUTH] Google OAuth initiated', {
    returnTo: redirectTo,
    callbackUrl,
    siteUrl,
    hasReturnTo: !!returnTo,
  })
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('[AUTH] Google OAuth error:', error)
    throw new Error(
      error.message === 'Unsupported provider: provider is not enabled'
        ? 'Google OAuth is not enabled in your Supabase project. Please enable it in Authentication > Providers > Google in your Supabase dashboard.'
        : error.message || 'Failed to sign in with Google'
    )
  }

  console.log('[AUTH] Google OAuth redirect URL generated', { url: data.url })
  return data
}

export const handleEmailAuth = async (email: string, returnTo?: string) => {
  if (typeof window === 'undefined') {
    throw new Error('Email auth can only be called from the browser')
  }

  const supabase = createClient()
  
  // Get returnTo from parameter or current page
  const redirectTo = returnTo || (window.location.pathname + window.location.search + window.location.hash)
  const siteUrl = getSiteUrl()
  
  // Build callback URL with redirectTo query param (for magic link fallback, though we use OTP)
  const callbackUrl = `${siteUrl}/auth/callback${redirectTo && redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`
  
  console.log('[AUTH] Email OTP initiated', {
    email,
    returnTo: redirectTo,
    callbackUrl,
    siteUrl,
    hasReturnTo: !!returnTo,
  })
  
  // OTP code-based sign-in (NOT magic link) - do NOT include emailRedirectTo
  // The redirectTo is stored in sessionStorage/cookie and will be used after OTP verification
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // Note: emailRedirectTo is for magic links, not OTP, but we include it for consistency
      // OTP verification happens in the same page, so redirectTo is handled via sessionStorage
    },
  })

  if (error) {
    console.error('[AUTH] Email OTP error:', {
      email,
      error: {
        message: error.message,
        status: error.status,
        name: error.name
      }
    })
    throw new Error(error.message || 'Failed to send verification code')
  }

  console.log('[AUTH] Email OTP sent successfully', { email })
  return { success: true }
}

export const handleEmailOtpVerify = async (email: string, otp: string) => {
  if (typeof window === 'undefined') {
    throw new Error('Email OTP verification can only be called from the browser')
  }

  const supabase = createClient()
  
  console.log('[AUTH] Email OTP verification attempt', { email, hasOtp: !!otp })
  
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
  })

  if (error) {
    console.error('[AUTH] Email OTP verification error:', {
      email,
      error: error.message,
    })
    throw new Error(error.message || 'Invalid or expired code')
  }

  console.log('[AUTH] Email OTP verified successfully', { email, userId: data.user?.id })
  return { success: true, data }
}

