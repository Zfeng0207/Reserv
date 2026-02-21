"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Check, Clock, Image as ImageIcon, X, DollarSign, Sparkles, ChevronDown, AlertTriangle, AlertCircle } from "lucide-react"
import { formatDistanceToNow, parseISO } from "date-fns"
import Image from "next/image"

type ValidationStatus = "success" | "partial" | "failed"
type ValidationResultItem = { id: string; status: "approved" | "flagged" | "failed"; reason?: string; participant_name: string }

interface PaymentUpload {
  id: string | null // null if no payment proof exists
  participantId: string
  participantName: string
  proofImageUrl: string | null
  paymentStatus: "pending_review" | "approved" | "rejected" | null // null if no payment proof
  createdAt: string | null // null if no payment proof
  amount: number | null
  currency: string | null
  hasProof: boolean // true if participant uploaded a proof, false if cash-only or unpaid
}

interface PaymentsReviewViewProps {
  sessionId: string
  uiMode: "dark" | "light"
  onBack: () => void
}

export function PaymentsReviewView({ sessionId, uiMode, onBack }: PaymentsReviewViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const listRef = useRef<HTMLDivElement>(null)
  const [uploads, setUploads] = useState<PaymentUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [markingCashId, setMarkingCashId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [validatingAll, setValidatingAll] = useState(false)
  const [validationResult, setValidationResult] = useState<{ status: ValidationStatus; results: ValidationResultItem[] } | null>(null)
  const [approvingValidation, setApprovingValidation] = useState(false)
  const [validationCollapsibleOpen, setValidationCollapsibleOpen] = useState(true)

  const glassCard = uiMode === "dark"
    ? "bg-black/30 border-white/20 text-white backdrop-blur-sm"
    : "bg-white/70 border-black/10 text-black backdrop-blur-sm"

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const { getPaymentUploadsForSession } = await import("@/app/host/sessions/[id]/actions")
        const result = await getPaymentUploadsForSession(sessionId)

        if (!result.ok) {
          toast({
            title: "Failed to load payments",
            description: result.error || "Please try again.",
            variant: "destructive",
          })
          return
        }

        setUploads(result.uploads)
      } catch (error: any) {
        console.error("[PaymentsReviewView] Error:", error)
        toast({
          title: "Failed to load payments",
          description: error?.message || "Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUploads()
  }, [sessionId, toast])

  const handleConfirmPaid = async (uploadId: string) => {
    if (!uploadId) return
    
    setConfirmingId(uploadId)
    try {
      const { confirmParticipantPaid } = await import("@/app/host/sessions/[id]/actions")
      const result = await confirmParticipantPaid(sessionId, uploadId)

      if (!result.ok) {
        toast({
          title: "Failed to confirm payment",
          description: result.error || "Please try again.",
          variant: "destructive",
        })
        return
      }

      // Refresh the list to get updated data
      const { getPaymentUploadsForSession } = await import("@/app/host/sessions/[id]/actions")
      const refreshResult = await getPaymentUploadsForSession(sessionId)
      if (refreshResult.ok) {
        setUploads(refreshResult.uploads)
      }

      toast({
        title: "Payment confirmed",
        description: "Marked as paid successfully.",
      })

      // Refresh analytics data
      router.refresh()
    } catch (error: any) {
      console.error("[PaymentsReviewView] Error confirming payment:", error)
      toast({
        title: "Failed to confirm payment",
        description: error?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setConfirmingId(null)
    }
  }

  const handleMarkPaidByCash = async (participantId: string) => {
    setMarkingCashId(participantId)
    try {
      const { markParticipantPaidByCash } = await import("@/app/host/sessions/[id]/actions")
      const result = await markParticipantPaidByCash(sessionId, participantId)

      if (!result.ok) {
        toast({
          title: "Failed to mark as paid",
          description: result.error || "Please try again.",
          variant: "destructive",
        })
        return
      }

      // Refresh the list to get updated data
      const { getPaymentUploadsForSession } = await import("@/app/host/sessions/[id]/actions")
      const refreshResult = await getPaymentUploadsForSession(sessionId)
      if (refreshResult.ok) {
        setUploads(refreshResult.uploads)
      }

      toast({
        title: "Marked as paid (cash)",
        description: "Participant has been marked as paid.",
      })

      // Refresh analytics data
      router.refresh()
    } catch (error: any) {
      console.error("[PaymentsReviewView] Error marking as paid:", error)
      toast({
        title: "Failed to mark as paid",
        description: error?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setMarkingCashId(null)
    }
  }

  const handleValidateAll = async () => {
    setValidatingAll(true)
    setValidationResult(null)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/validate-payments`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({
          title: "Validation failed",
          description: data.error || "Could not validate receipts.",
          variant: "destructive",
        })
        return
      }
      setValidationResult({ status: data.status, results: data.results || [] })
    } catch (err: any) {
      toast({
        title: "Validation failed",
        description: err?.message || "Network error.",
        variant: "destructive",
      })
    } finally {
      setValidatingAll(false)
    }
  }

  const handleApproveValidation = async () => {
    if (!validationResult) return
    const toApprove = validationResult.results.filter((r) => r.status === "approved").map((r) => r.id)
    if (toApprove.length === 0) return
    setApprovingValidation(true)
    try {
      const { bulkApprovePaymentProofs } = await import("@/app/host/sessions/[id]/actions")
      const result = await bulkApprovePaymentProofs(sessionId, toApprove)
      if (!result.ok) {
        toast({
          title: "Approve failed",
          description: result.error || "Please try again.",
          variant: "destructive",
        })
        return
      }
      toast({
        title: "Payments approved",
        description: `${toApprove.length} payment(s) marked as confirmed.`,
      })
      setValidationResult(null)
      const { getPaymentUploadsForSession } = await import("@/app/host/sessions/[id]/actions")
      const refreshResult = await getPaymentUploadsForSession(sessionId)
      if (refreshResult.ok) setUploads(refreshResult.uploads)
      router.refresh()
    } catch (err: any) {
      toast({
        title: "Approve failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setApprovingValidation(false)
    }
  }

  const scrollToProof = (proofId: string) => {
    const el = listRef.current?.querySelector(`[data-proof-id="${proofId}"]`)
    if (el) {
      ;(el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase() || "?"
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
    } catch {
      return "Recently"
    }
  }

  const getStatusBadge = (status: "pending_review" | "approved" | "rejected" | null) => {
    switch (status) {
      case "approved":
        return {
          label: "Confirmed",
          color: "bg-green-500/20 text-green-400 border-green-500/30",
        }
      case "rejected":
        return {
          label: "Rejected",
          color: "bg-red-500/20 text-red-400 border-red-500/30",
        }
      case "pending_review":
        return {
          label: "Pending",
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        }
      default:
        return {
          label: "Unpaid",
          color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
        }
    }
  }

  if (loading) {
    return (
      <div className={cn("min-h-screen", uiMode === "dark" ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-white")}>
        <div className="p-4">
          {/* Header skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
            <div className="flex-1 h-8 bg-white/10 rounded animate-pulse" />
          </div>
          {/* Cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className={cn("p-4", glassCard)}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-48 bg-white/10 rounded-lg animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen pb-[200px]", uiMode === "dark" ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-white")}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0",
              uiMode === "dark"
                ? "text-white hover:bg-white/10"
                : "text-black hover:bg-black/10"
            )}
            aria-label="Back to session control"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className={cn("text-2xl font-semibold", uiMode === "dark" ? "text-white" : "text-black")}>
              Payment uploads
            </h1>
            {uploads.length > 0 && (
              <p className={cn("text-sm mt-1", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
                {uploads.length} participant{uploads.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {uploads.length > 0 && (
            <Button
              onClick={handleValidateAll}
              disabled={validatingAll}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium",
                "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500",
                "text-white hover:from-violet-400 hover:via-fuchsia-400 hover:to-indigo-400",
                "shadow-lg shadow-violet-500/25",
                "animate-pulse hover:animate-none",
                "transition-all duration-300",
                validatingAll && "opacity-70 pointer-events-none"
              )}
              aria-label="Validate all payment receipts with AI"
              aria-busy={validatingAll}
            >
              <Sparkles className="w-4 h-4 mr-2 shrink-0" aria-hidden />
              {validatingAll ? "Validating…" : "AI Validate All"}
            </Button>
          )}
        </div>

        {/* Full-screen validation overlay */}
        <AnimatePresence>
          {validatingAll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm"
              role="status"
              aria-live="polite"
              aria-label="Validating receipts"
            >
              <div className={cn("w-12 h-12 rounded-full border-2 border-t-transparent border-white/80 animate-spin")} />
              <p className={cn("text-lg font-medium", "text-white")}>Validating receipts…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation result banners */}
        {validationResult && !validatingAll && (
          <div className="space-y-3" role="region" aria-label="Validation result">
            {validationResult.status === "success" && (
              <Alert className={cn("rounded-xl border-green-500/30 bg-green-500/10")}>
                <Check className="h-4 w-4 text-green-500" aria-hidden />
                <AlertTitle className="text-green-600 dark:text-green-400">All payments confirmed!</AlertTitle>
                <AlertDescription>
                  {validationResult.results.length === 0
                    ? "No pending proofs to validate."
                    : `${validationResult.results.length} receipt(s) validated.`}
                  {uploads.some((u) => !u.id || u.paymentStatus !== "approved") && (
                    <span className="block mt-2">
                      Unpaid: {uploads.filter((u) => !u.id || u.paymentStatus !== "approved").map((u) => u.participantName).join(", ") || "—"}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {validationResult.status === "partial" && (
              <Alert className={cn("rounded-xl border-amber-500/30 bg-amber-500/10")}>
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
                <AlertTitle className="text-amber-700 dark:text-amber-300">
                  {validationResult.results.filter((r) => r.status === "approved").length} approved, {validationResult.results.filter((r) => r.status === "flagged" || r.status === "failed").length} flagged
                </AlertTitle>
                <AlertDescription>
                  <Collapsible open={validationCollapsibleOpen} onOpenChange={setValidationCollapsibleOpen}>
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className={cn("flex items-center gap-1 font-medium underline underline-offset-2", uiMode === "dark" ? "text-white/90" : "text-black/90")}
                        aria-expanded={validationCollapsibleOpen}
                      >
                        View issues <ChevronDown className={cn("w-4 h-4 transition-transform", validationCollapsibleOpen && "rotate-180")} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                        {validationResult.results.filter((r) => r.status !== "approved").map((r) => (
                          <li key={r.id}>
                            {r.participant_name}: {r.reason || r.status}
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </AlertDescription>
              </Alert>
            )}
            {validationResult.status === "failed" && (
              <Alert className={cn("rounded-xl border-red-500/30 bg-red-500/10")} variant="destructive">
                <AlertCircle className="h-4 w-4 text-red-500" aria-hidden />
                <AlertTitle className="text-red-700 dark:text-red-300">Fraud detected / duplicates found</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {validationResult.results.filter((r) => r.status === "failed").map((r) => (
                      <li key={r.id}>{r.participant_name}: {r.reason || "Validation failed"}</li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("mt-3 rounded-full", uiMode === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-black/20 text-black hover:bg-black/10")}
                    onClick={() => validationResult.results.filter((r) => r.status === "failed").length > 0 && scrollToProof(validationResult.results.find((r) => r.status === "failed")!.id)}
                    aria-label="Scroll to first affected payment card"
                  >
                    Review manually
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-2">
              {validationResult.results.some((r) => r.status === "approved") && (
                <Button
                  onClick={handleApproveValidation}
                  disabled={approvingValidation}
                  className="rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 text-black font-medium hover:from-lime-400 hover:to-emerald-400"
                  aria-label="Approve validated payments"
                >
                  {approvingValidation ? "Approving…" : "Approve validation"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn("rounded-full", uiMode === "dark" ? "text-white/80 hover:text-white" : "text-black/80 hover:text-black")}
                onClick={() => setValidationResult(null)}
                aria-label="Dismiss validation result"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && uploads.length === 0 && (
          <Card className={cn("p-8 text-center", glassCard)}>
            <ImageIcon className={cn("w-12 h-12 mx-auto mb-4", uiMode === "dark" ? "text-white/40" : "text-black/40")} />
            <h3 className={cn("text-lg font-semibold mb-2", uiMode === "dark" ? "text-white" : "text-black")}>
              No participants yet
            </h3>
            <p className={cn("text-sm", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
              When participants join, they'll appear here.
            </p>
          </Card>
        )}

        {/* Upload list */}
        {uploads.length > 0 && (
          <div ref={listRef} className="space-y-4">
            {uploads.map((upload) => {
              const statusBadge = getStatusBadge(upload.paymentStatus)
              const isConfirming = confirmingId === upload.id
              const isMarkingCash = markingCashId === upload.participantId
              const isConfirmed = upload.paymentStatus === "approved"
              const hasUpload = upload.hasProof
              const hasNoProof = !upload.proofImageUrl && !upload.hasProof

              return (
                <motion.div
                  key={upload.participantId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  data-participant-id={upload.participantId}
                  {...(upload.id ? { "data-proof-id": upload.id } : {})}
                >
                  <Card className={cn("p-4", glassCard)}>
                    <div className="space-y-4">
                      {/* Participant info */}
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold border shrink-0",
                            uiMode === "dark"
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-black/10 border-black/20 text-black"
                          )}
                        >
                          {getInitial(upload.participantName)}
                        </div>

                        {/* Name and time */}
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium truncate", uiMode === "dark" ? "text-white" : "text-black")}>
                            {upload.participantName}
                          </p>
                          <p className={cn("text-xs flex items-center gap-1", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
                            {upload.createdAt ? (
                              <>
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(upload.createdAt)}
                              </>
                            ) : (
                              "No upload yet"
                            )}
                          </p>
                        </div>

                        {/* Status badge */}
                        <Badge className={cn("shrink-0 text-xs border", statusBadge.color)}>
                          {statusBadge.label}
                        </Badge>
                      </div>

                      {/* Amount (if available) */}
                      {upload.amount && (
                        <div className={cn("text-sm font-medium", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                          {upload.currency || "RM"} {upload.amount.toFixed(2)}
                        </div>
                      )}

                      {/* Image preview (if proof uploaded) */}
                      {upload.proofImageUrl && (
                        <div
                          onClick={() => setSelectedImage(upload.proofImageUrl!)}
                          className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-800 cursor-pointer group"
                        >
                          <Image
                            src={upload.proofImageUrl}
                            alt={`Payment proof from ${upload.participantName}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                            sizes="(max-width: 768px) 100vw, 400px"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                        </div>
                      )}


                      {/* Action buttons */}
                      {!isConfirmed && (
                        <>
                          {/* Confirm paid button (if proof uploaded) */}
                          {upload.id && upload.proofImageUrl && (
                            <Button
                              onClick={() => handleConfirmPaid(upload.id!)}
                              disabled={isConfirming}
                              className={cn(
                                "w-full rounded-full font-medium",
                                "bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black",
                                isConfirming && "opacity-50"
                              )}
                            >
                              <AnimatePresence mode="wait">
                                {isConfirming ? (
                                  <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Confirming...
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="confirm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                  >
                                    Confirm paid
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Button>
                          )}

                          {/* Mark paid (cash) button (if no proof) */}
                          {!upload.id && (
                            <Button
                              onClick={() => handleMarkPaidByCash(upload.participantId)}
                              disabled={isMarkingCash}
                              className={cn(
                                "w-full rounded-full font-medium",
                                "bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black",
                                isMarkingCash && "opacity-50"
                              )}
                            >
                              <AnimatePresence mode="wait">
                                {isMarkingCash ? (
                                  <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Marking...
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="mark"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                  >
                                    <DollarSign className="w-4 h-4" />
                                    Mark paid (cash)
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Button>
                          )}
                        </>
                      )}

                      {/* Confirmed state */}
                      {isConfirmed && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className={cn(
                            "flex items-center justify-center gap-2 py-2 rounded-full",
                            "bg-green-500/20 border border-green-500/30"
                          )}
                        >
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium text-green-400">
                            Payment confirmed {!hasUpload && "(cash)"}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Image lightbox dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/90 border-white/20">
          <DialogHeader className="sr-only">
            <DialogTitle>Payment proof image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full aspect-auto max-h-[80vh]">
              <Image
                src={selectedImage}
                alt="Payment proof"
                width={1200}
                height={1600}
                className="w-full h-full object-contain"
                unoptimized
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

