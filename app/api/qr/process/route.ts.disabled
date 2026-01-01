import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/qr/process
 * 
 * Proxy endpoint that forwards QR image processing requests to the Python microservice.
 * 
 * Environment Variable:
 *   QR_SERVICE_URL - URL of the deployed Flask QR service (e.g., https://qr-service.onrender.com)
 * 
 * Request:
 *   - Content-Type: multipart/form-data
 *   - Field: "image" (File)
 * 
 * Response:
 *   {
 *     ok: boolean,
 *     full_name: string | null,
 *     qr_payload: string | null,
 *     qr_crop_base64: string | null,
 *     debug: object
 *   }
 */

const QR_SERVICE_URL = process.env.QR_SERVICE_URL || "http://localhost:5000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json(
        {
          ok: false,
          error: "No image provided",
          full_name: null,
          qr_payload: null,
          qr_crop_base64: null,
          debug: { reason: "missing_image" },
        },
        { status: 400 }
      )
    }

    // Forward to Python QR service
    const serviceFormData = new FormData()
    serviceFormData.append("image", image)

    const serviceUrl = `${QR_SERVICE_URL}/api/qr/process`
    console.log(`[QR API] Forwarding to service: ${serviceUrl}`)

    const response = await fetch(serviceUrl, {
      method: "POST",
      body: serviceFormData,
      // Don't set Content-Type header - let fetch set it with boundary
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error(`[QR API] Service error:`, errorData)
      
      return NextResponse.json(
        {
          ok: false,
          error: errorData.error || `Service returned ${response.status}`,
          full_name: null,
          qr_payload: null,
          qr_crop_base64: null,
          debug: errorData.debug || { status: response.status },
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`[QR API] Success:`, { ok: result.ok, has_name: !!result.full_name })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[QR API] Error:", error)
    
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to process QR image",
        full_name: null,
        qr_payload: null,
        qr_crop_base64: null,
        debug: { error: error?.message },
      },
      { status: 500 }
    )
  }
}

