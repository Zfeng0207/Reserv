/**
 * Supabase Auth utilities
 * 
 * Configure these environment variables in your .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 */

import { createClient } from './supabase/client'

export const handleGoogleOAuth = async (returnTo?: string) => {
  if (typeof window === 'undefined') return

  const supabase = createClient()
  
  // Get returnTo from parameter or current page
  const redirectTo = returnTo || (typeof window !== 'undefined' ? window.location.pathname + window.location.search + window.location.hash : '/')
  
  // Build callback URL with redirectTo query param
  const callbackUrl = `${window.location.origin}/auth/callback${redirectTo && redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`
  
  // Use window.location.origin for Vercel compatibility - automatically works on any domain
  // (localhost for dev, *.vercel.app for production, custom domains, etc.)
  // This ensures the redirect URL is always correct without hardcoding
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
    console.error('Error signing in with Google:', error)
    // Throw error so it can be caught by the calling component
    throw new Error(
      error.message === 'Unsupported provider: provider is not enabled'
        ? 'Google OAuth is not enabled in your Supabase project. Please enable it in Authentication > Providers > Google in your Supabase dashboard.'
        : error.message || 'Failed to sign in with Google'
    )
  }

  // If successful, data.url will be set and Supabase will handle the redirect
  return data
}

export const handleEmailAuth = async (email: string, returnTo?: string) => {
  if (typeof window === 'undefined') {
    throw new Error('Email auth can only be called from the browser')
  }

  const supabase = createClient()
  
  // Get returnTo from parameter or current page
  const redirectTo = returnTo || (typeof window !== 'undefined' ? window.location.pathname + window.location.search + window.location.hash : '/')
  
  // Build callback URL with redirectTo query param (for magic link fallback, though we use OTP)
  const callbackUrl = `${window.location.origin}/auth/callback${redirectTo && redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`
  
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

  // Detailed logging for diagnosis
  console.log('[OTP] Full response:', { 
    email, 
    data, 
    error: error ? {
      message: error.message,
      status: error.status,
      name: error.name
    } : null 
  })

  if (error) {
    console.error('Error signing in with email:', error)
    throw new Error(error.message || 'Failed to send verification code')
  }

  // Log success for diagnosis
  console.log('[OTP] Successfully sent code to:', email)

  return { success: true }
}

export const handleEmailOtpVerify = async (email: string, otp: string) => {
  if (typeof window === 'undefined') {
    throw new Error('Email OTP verification can only be called from the browser')
  }

  const supabase = createClient()
  
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
  })

  if (error) {
    console.error('Error verifying OTP:', error)
    throw new Error(error.message || 'Invalid or expired code')
  }

  return { success: true, data }
}

