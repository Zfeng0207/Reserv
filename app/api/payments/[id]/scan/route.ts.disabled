import { NextRequest, NextResponse } from "next/server"
import { createClient, getUserId } from "@/lib/supabase/server/server"

/**
 * POST /api/payments/[id]/scan
 * 
 * Triggers OCR scanning of a payment proof image.
 * 
 * Flow:
 * 1. Verify user has permission (host of session or participant who uploaded)
 * 2. Fetch payment_proofs record to get proof_image_url
 * 3. Call OCR service (Python script or external API)
 * 4. Extract bank_name, account_number, account_name
 * 5. Update payment_proofs record with extracted data + ocr_status
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params
    const supabase = await createClient()
    const userId = await getUserId(supabase)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch payment proof record
    const { data: payment, error: fetchError } = await supabase
      .from("payment_proofs")
      .select("proof_image_url, session_id, participant_id, ocr_status")
      .eq("id", paymentId)
      .single()

    if (fetchError || !payment) {
      return NextResponse.json(
        { error: "Payment proof not found" },
        { status: 404 }
      )
    }

    // Verify user has permission:
    // - Host of the session, OR
    // - Participant who uploaded the proof
    const { data: session } = await supabase
      .from("sessions")
      .select("host_id")
      .eq("id", payment.session_id)
      .single()

    const { data: participant } = await supabase
      .from("participants")
      .select("id")
      .eq("id", payment.participant_id)
      .single()

    // Check if user is host OR participant (for now, allow host only - adjust as needed)
    if (!session || session.host_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have permission to scan this payment" },
        { status: 403 }
      )
    }

    if (!payment.proof_image_url) {
      return NextResponse.json(
        { error: "Payment proof image URL is missing" },
        { status: 400 }
      )
    }

    // Update status to pending
    await supabase
      .from("payment_proofs")
      .update({ ocr_status: "pending" })
      .eq("id", paymentId)

    // TODO: Call OCR service
    // Option A: If Python script is on same server
    // const ocrResult = await runOcrScript(payment.proof_image_url)
    // 
    // Option B: If OCR is a separate service (recommended)
    // const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || "http://localhost:8000/scan"
    // const ocrResponse = await fetch(OCR_SERVICE_URL, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ image_url: payment.proof_image_url }),
    // })
    // 
    // if (!ocrResponse.ok) {
    //   throw new Error("OCR service failed")
    // }
    // const ocrResult = await ocrResponse.json()

    // Placeholder OCR result (replace with actual OCR service call)
    const ocrResult = {
      bank_name: null,
      account_number: null,
      account_name: null,
      raw_text: "",
      confidence_notes: ["OCR service not yet integrated"],
    }

    // Calculate confidence score (0-1) based on how many fields were detected
    const detectedFields = [
      ocrResult.bank_name,
      ocrResult.account_number,
      ocrResult.account_name,
    ].filter(Boolean).length
    const ocrConfidence = detectedFields / 3

    // Update payment_proofs record with extracted data
    const updateData: {
      bank_name: string | null
      account_number: string | null
      account_name: string | null
      ocr_status: "success" | "failed"
      ocr_confidence: number
      ocr_payload: any
      scanned_at: string
    } = {
      bank_name: ocrResult.bank_name || null,
      account_number: ocrResult.account_number || null,
      account_name: ocrResult.account_name || null,
      ocr_status: detectedFields > 0 ? "success" : "failed",
      ocr_confidence: ocrConfidence,
      ocr_payload: {
        raw_text: ocrResult.raw_text,
        confidence_notes: ocrResult.confidence_notes,
        extracted_at: new Date().toISOString(),
      },
      scanned_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from("payment_proofs")
      .update(updateData)
      .eq("id", paymentId)

    if (updateError) {
      console.error("[scan-payment] Update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update payment proof with OCR results" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        bank_name: ocrResult.bank_name,
        account_number: ocrResult.account_number,
        account_name: ocrResult.account_name,
        confidence: ocrConfidence,
        status: updateData.ocr_status,
      },
    })
  } catch (error: any) {
    console.error("[scan-payment] Error:", error)
    
    // Update status to failed on error
    try {
      const { id: paymentId } = await params
      const supabase = await createClient()
      await supabase
        .from("payment_proofs")
        .update({ ocr_status: "failed" })
        .eq("id", paymentId)
    } catch (updateErr) {
      // Ignore update error if we're already in error state
    }

    return NextResponse.json(
      { error: error?.message || "Failed to scan payment proof" },
      { status: 500 }
    )
  }
}

