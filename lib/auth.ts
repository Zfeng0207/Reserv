/**
 * Supabase Auth utilities
 * 
 * Configure these environment variables in your .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 */

import { createClient } from './supabase/client'

export const handleGoogleOAuth = async () => {
  if (typeof window === 'undefined') return

  const supabase = createClient()
  
  // Use window.location.origin for Vercel compatibility - automatically works on any domain
  // (localhost for dev, *.vercel.app for production, custom domains, etc.)
  // This ensures the redirect URL is always correct without hardcoding
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
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

export const handleEmailAuth = async (email: string) => {
  if (typeof window === 'undefined') {
    throw new Error('Email auth can only be called from the browser')
  }

  const supabase = createClient()
  
  // OTP code-based sign-in (NOT magic link) - do NOT include emailRedirectTo
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
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

