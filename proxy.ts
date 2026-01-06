import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * DEPRECATED: This proxy is being phased out in favor of native Supabase Auth.
 * 
 * For now, this only handles session refresh via cookies (no custom auth logic).
 * All auth should use Supabase Auth directly via @supabase/ssr.
 * 
 * TODO: Remove this entirely once all auth flows use native Supabase.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ ALWAYS allow API routes through untouched
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // ✅ ALWAYS allow auth routes through untouched
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  // Minimal session refresh for non-API/auth routes (Supabase SSR pattern)
  // This only refreshes cookies, doesn't implement custom auth
  let response = NextResponse.next({ request: req })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value)
            })
            response = NextResponse.next({ request: req })
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Refresh session to update cookies if needed (Supabase SSR pattern)
    await supabase.auth.getUser()
  } catch (error) {
    // Ignore auth errors - this is just for cookie refresh
    console.log("[AUTH] Proxy session refresh error (non-critical):", error)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

