"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Chrome, Mail, ArrowLeft } from "lucide-react"
import { handleGoogleOAuth, handleEmailAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinueAsGuest?: (name: string) => void
}

export function LoginDialog({ open, onOpenChange, onContinueAsGuest }: LoginDialogProps) {
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [guestName, setGuestName] = useState("")

  // Close dialog when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && open) {
      onOpenChange(false)
      // Reset guest form
      setShowGuestForm(false)
      setGuestName("")
    }
  }, [isAuthenticated, open, onOpenChange])

  const handleGuestContinue = () => {
    setShowGuestForm(true)
  }

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!guestName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue as guest",
        variant: "destructive",
      })
      return
    }

    // Store guest name in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("guestName", guestName.trim())
    }

    if (onContinueAsGuest) {
      onContinueAsGuest(guestName.trim())
    }
    onOpenChange(false)
    // Reset state
    setShowGuestForm(false)
    setGuestName("")
  }

  const handleBackToLogin = () => {
    setShowGuestForm(false)
    setGuestName("")
  }

  // Reset form when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShowGuestForm(false)
      setGuestName("")
    }
    onOpenChange(isOpen)
  }

  const handleGoogleClick = async () => {
    try {
      await handleGoogleOAuth()
      // Don't close dialog immediately - Supabase will redirect if successful
    } catch (error: any) {
      // Handle error - show toast notification
      toast({
        title: "Authentication Error",
        description: error?.message || "Google OAuth is not enabled. Please enable it in your Supabase dashboard.",
        variant: "destructive",
      })
    }
  }

  const handleEmailClick = () => {
    handleEmailAuth()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 text-white">
        {!showGuestForm ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Welcome to RESERV</DialogTitle>
              <DialogDescription className="text-white/60">
                Sign in to save your sessions and manage your events
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              {/* OAuth Options - Main/Prominent */}
              <Button
                onClick={handleGoogleClick}
                className="w-full bg-white hover:bg-white/90 text-black font-medium h-12 text-base shadow-lg"
                size="lg"
              >
                <Chrome className="mr-2 h-5 w-5" />
                Continue with Google
              </Button>

              <Button
                onClick={handleEmailClick}
                variant="outline"
                className="w-full border-white/30 bg-white/5 hover:bg-white/10 text-white font-medium h-12 text-base"
                size="lg"
              >
                <Mail className="mr-2 h-5 w-5" />
                Continue with Email
              </Button>

              {/* Separator */}
              <div className="relative py-2">
                <Separator className="bg-white/10" />
              </div>

              {/* Continue as Guest - Less Visible */}
              <button
                onClick={handleGuestContinue}
                className="w-full text-center text-white/40 hover:text-white/60 text-xs font-normal py-2 transition-colors underline-offset-4 hover:underline"
              >
                Continue as guest
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Continue as Guest</DialogTitle>
              <DialogDescription className="text-white/60">
                Enter your name to continue as a guest
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleGuestSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="guestName" className="text-white">
                  Your Name
                </Label>
                <Input
                  id="guestName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="bg-slate-700/50 border-white/10 text-white placeholder:text-white/40"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToLogin}
                  className="border-white/30 bg-white/5 hover:bg-white/10 text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-white hover:bg-white/90 text-black font-medium"
                >
                  Continue
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

