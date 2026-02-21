import { NextResponse } from "next/server"
import { getSessionAccess } from "@/app/host/sessions/[id]/actions"
import { runSessionPaymentValidation } from "@/app/host/sessions/[id]/actions"
import { createClient } from "@/lib/supabase/server/server"
import { getUserId } from "@/lib/supabase/server/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * POST /api/sessions/[id]/validate-payments
 * Runs AI validation on all pending payment proofs for the session.
 * Returns structured JSON for the Payment uploads UI.
 * Backend validation logic can be wired to ai_receipt_validator/verifier.py (e.g. via subprocess or separate service).
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const supabase = await createClient()
    const userId = await getUserId(supabase)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const access = await getSessionAccess(sessionId)
    if (!access.ok) {
      return NextResponse.json({ error: access.error || "Forbidden" }, { status: 403 })
    }

    const result = await runSessionPaymentValidation(sessionId)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      status: result.status,
      results: result.results,
    })
  } catch (error) {
    console.error("[validate-payments] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Validation failed" },
      { status: 500 }
    )
  }
}
