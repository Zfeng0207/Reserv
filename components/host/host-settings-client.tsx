"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Settings, User, Mail, LogOut, Save, Trash2 } from "lucide-react"
import { getHostSettings, updateHostSettings, getUserProfile, updateUserDisplayName, deleteAllDrafts, type HostSettings } from "@/app/host/settings/actions"
import { useAuth } from "@/lib/hooks/use-auth"

export function HostSettingsClient() {
  const router = useRouter()
  const { toast } = useToast()
  const { logOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uiMode, setUiMode] = useState<"dark" | "light">("dark")

  // Profile state
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [displayNameDraft, setDisplayNameDraft] = useState("")

  // Settings state
  const [settings, setSettings] = useState<HostSettings | null>(null)
  const [paymentInstructionsDraft, setPaymentInstructionsDraft] = useState("")

  // Dialog state
  const [deleteDraftsDialogOpen, setDeleteDraftsDialogOpen] = useState(false)
  const [isDeletingDrafts, setIsDeletingDrafts] = useState(false)

  // Sync uiMode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("reserv-ui-mode") as "dark" | "light" | null
      if (saved === "dark" || saved === "light") {
        setUiMode(saved)
      }
    }
  }, [])

  // Load settings and profile on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load profile
        const profileResult = await getUserProfile()
        if (profileResult.ok) {
          setEmail(profileResult.email)
          setDisplayName(profileResult.displayName || "")
          setDisplayNameDraft(profileResult.displayName || "")
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile",
            variant: "destructive",
          })
        }

        // Load settings
        const settingsResult = await getHostSettings()
        if (settingsResult.ok) {
          setSettings(settingsResult.settings)
          setPaymentInstructionsDraft(settingsResult.settings.default_payment_instructions || "")
        } else {
          toast({
            title: "Error",
            description: "Failed to load settings",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const glassCard = uiMode === "dark"
    ? "bg-black/30 border-white/20 text-white backdrop-blur-sm"
    : "bg-white/70 border-black/10 text-black backdrop-blur-sm"

  const handleSaveDisplayName = async () => {
    if (displayNameDraft.trim() === displayName) return

    try {
      setSaving(true)
      const result = await updateUserDisplayName(displayNameDraft.trim())
      if (result.ok) {
        setDisplayName(displayNameDraft.trim())
        toast({
          title: "Profile updated",
          description: "Your display name has been saved.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update display name",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save display name:", error)
      toast({
        title: "Error",
        description: "Failed to update display name",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSettings = async (updates: Partial<HostSettings>) => {
    if (!settings) return

    try {
      const newSettings = { ...settings, ...updates }
      setSettings(newSettings)

      const result = await updateHostSettings(updates)
      if (result.ok) {
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated.",
        })
      } else {
        // Revert on error
        setSettings(settings)
        toast({
          title: "Error",
          description: result.error || "Failed to save settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      // Revert on error
      setSettings(settings)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await logOut()
      toast({ title: "Signed out" })
      // Stay on current page, refresh server components if needed
      router.refresh()
    } catch (error: any) {
      toast({ 
        title: "Sign out failed", 
        description: error?.message || "Failed to sign out",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAllDrafts = async () => {
    try {
      setIsDeletingDrafts(true)
      const result = await deleteAllDrafts()
      if (result.ok) {
        toast({
          title: "Drafts deleted",
          description: `Successfully deleted ${result.count} draft(s).`,
        })
        setDeleteDraftsDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete drafts",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete drafts:", error)
      toast({
        title: "Error",
        description: "Failed to delete drafts",
        variant: "destructive",
      })
    } finally {
      setIsDeletingDrafts(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={cn("text-center", uiMode === "dark" ? "text-white" : "text-black")}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className={cn("p-6 max-w-md w-full", glassCard)}>
          <p className={cn("text-center", uiMode === "dark" ? "text-white/70" : "text-black/70")}>
            Failed to load settings. Please try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 w-full"
          >
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className={cn("sticky top-0 z-40 border-b backdrop-blur-xl", uiMode === "dark" ? "bg-black/40 border-white/10" : "bg-white/80 border-black/10")}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className={cn(uiMode === "dark" ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Settings className={cn("h-5 w-5", uiMode === "dark" ? "text-white" : "text-black")} />
            <h1 className={cn("text-xl font-semibold", uiMode === "dark" ? "text-white" : "text-black")}>
              Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* SECTION A: Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className={cn("p-6", glassCard)}>
            <div className="flex items-center gap-2 mb-4">
              <User className={cn("h-5 w-5", uiMode === "dark" ? "text-white/70" : "text-black/70")} />
              <h2 className={cn("text-lg font-semibold", uiMode === "dark" ? "text-white" : "text-black")}>
                Profile
              </h2>
            </div>
            <div className="space-y-4">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display-name" className={cn("text-sm", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                  Display name
                </Label>
                <p className={cn("text-xs", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
                  Shown on your invites as the host.
                </p>
                <div className="flex gap-2">
                  <Input
                    id="display-name"
                    value={displayNameDraft}
                    onChange={(e) => setDisplayNameDraft(e.target.value)}
                    className={cn(
                      "flex-1",
                      uiMode === "dark"
                        ? "bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        : "bg-black/5 border-black/20 text-black placeholder:text-black/40"
                    )}
                    placeholder="Your name"
                  />
                  <Button
                    onClick={handleSaveDisplayName}
                    disabled={saving || displayNameDraft.trim() === displayName}
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white"
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label className={cn("text-sm", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                  Email
                </Label>
                <div className="flex items-center gap-2">
                  <Mail className={cn("h-4 w-4", uiMode === "dark" ? "text-white/60" : "text-black/60")} />
                  <p className={cn("text-sm", uiMode === "dark" ? "text-white/70" : "text-black/70")}>
                    {email}
                  </p>
                </div>
              </div>

              {/* Sign Out */}
              <div className="pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className={cn(
                    "w-full",
                    uiMode === "dark"
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : "border-red-600/30 text-red-600 hover:bg-red-50"
                  )}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SECTION B: Default Session Behavior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className={cn("p-6", glassCard)}>
            <h2 className={cn("text-lg font-semibold mb-4", uiMode === "dark" ? "text-white" : "text-black")}>
              Default session behavior
            </h2>
            <p className={cn("text-xs mb-4", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
              These defaults apply when creating new sessions.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="require-payment-default" className={cn("text-sm", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                    Require payment proof by default
                  </Label>
                </div>
                <Switch
                  id="require-payment-default"
                  checked={settings.require_payment_proof_default}
                  onCheckedChange={(checked) => handleUpdateSettings({ require_payment_proof_default: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="waiting-list-default" className={cn("text-sm", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                    Enable waiting list by default
                  </Label>
                </div>
                <Switch
                  id="waiting-list-default"
                  checked={settings.waiting_list_default}
                  onCheckedChange={(checked) => handleUpdateSettings({ waiting_list_default: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="auto-close-default" className={cn("text-sm", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                    Auto-close when full by default
                  </Label>
                </div>
                <Switch
                  id="auto-close-default"
                  checked={settings.auto_close_when_full_default}
                  onCheckedChange={(checked) => handleUpdateSettings({ auto_close_when_full_default: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="show-guest-list-default" className={cn("text-sm", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                    Show guest list publicly by default
                  </Label>
                </div>
                <Switch
                  id="show-guest-list-default"
                  checked={settings.show_guest_list_publicly_default}
                  onCheckedChange={(checked) => handleUpdateSettings({ show_guest_list_publicly_default: checked })}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SECTION C: Payment Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className={cn("p-6", glassCard)}>
            <h2 className={cn("text-lg font-semibold mb-4", uiMode === "dark" ? "text-white" : "text-black")}>
              Payment preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="allow-cash" className={cn("text-sm", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                    Allow cash payments
                  </Label>
                  <p className={cn("text-xs mt-1", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
                    Enable "Mark paid (cash)" option in payment uploads
                  </p>
                </div>
                <Switch
                  id="allow-cash"
                  checked={settings.allow_cash_payments}
                  onCheckedChange={(checked) => handleUpdateSettings({ allow_cash_payments: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-instructions" className={cn("text-sm", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                  Default payment instructions
                </Label>
                <p className={cn("text-xs", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
                  Used as default helper text for new sessions
                </p>
                <Textarea
                  id="payment-instructions"
                  value={paymentInstructionsDraft}
                  onChange={(e) => setPaymentInstructionsDraft(e.target.value)}
                  onBlur={() => {
                    if (paymentInstructionsDraft !== (settings.default_payment_instructions || "")) {
                      handleUpdateSettings({ default_payment_instructions: paymentInstructionsDraft.trim() || null })
                    }
                  }}
                  className={cn(
                    "min-h-[100px]",
                    uiMode === "dark"
                      ? "bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      : "bg-black/5 border-black/20 text-black placeholder:text-black/40"
                  )}
                  placeholder="e.g., Transfer to Maybank 1234567890. Include your name in the reference."
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SECTION D: Automation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className={cn("p-6", glassCard)}>
            <h2 className={cn("text-lg font-semibold mb-4", uiMode === "dark" ? "text-white" : "text-black")}>
              Automation
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="auto-unpublish" className={cn("text-sm", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                    Auto-unpublish 48h after end time
                  </Label>
                  <p className={cn("text-xs mt-1", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
                    Sessions automatically unpublish 48 hours after the end time
                  </p>
                </div>
                <Switch
                  id="auto-unpublish"
                  checked={settings.auto_unpublish_enabled}
                  onCheckedChange={(checked) => handleUpdateSettings({ auto_unpublish_enabled: checked })}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SECTION E: Privacy & Data Cleanup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className={cn("p-6", glassCard)}>
            <h2 className={cn("text-lg font-semibold mb-4", uiMode === "dark" ? "text-white" : "text-black")}>
              Privacy & data cleanup
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="auto-delete" className={cn("text-sm", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
                    Auto-delete participant data after session ends/unpublishes
                  </Label>
                  <p className={cn("text-xs mt-1", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
                    Remove participant and payment data when session is ended or unpublished
                  </p>
                </div>
                <Switch
                  id="auto-delete"
                  checked={settings.auto_delete_participant_data}
                  onCheckedChange={(checked) => handleUpdateSettings({ auto_delete_participant_data: checked })}
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDraftsDialogOpen(true)}
                  className={cn(
                    "w-full",
                    uiMode === "dark"
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : "border-red-600/30 text-red-600 hover:bg-red-50"
                  )}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear all drafts
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Delete Drafts Dialog */}
      <Dialog open={deleteDraftsDialogOpen} onOpenChange={setDeleteDraftsDialogOpen}>
        <DialogContent className={cn(uiMode === "dark" ? "bg-slate-900 border-white/20 text-white" : "bg-white border-black/20 text-black")}>
          <DialogHeader>
            <DialogTitle>Delete all drafts?</DialogTitle>
            <DialogDescription className={cn(uiMode === "dark" ? "text-white/70" : "text-black/70")}>
              This action cannot be undone. All your draft sessions will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDraftsDialogOpen(false)}
              className={cn(uiMode === "dark" ? "border-white/20" : "border-black/20")}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllDrafts}
              disabled={isDeletingDrafts}
            >
              {isDeletingDrafts ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

