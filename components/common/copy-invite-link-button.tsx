"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface CopyInviteLinkButtonProps {
  sessionId: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  showLabel?: boolean
  label?: string
}

export function CopyInviteLinkButton({
  sessionId,
  className,
  variant = "default",
  size = "default",
  showLabel = true,
  label = "Copy invite link",
}: CopyInviteLinkButtonProps) {
  const { toast } = useToast()
  const [isCopying, setIsCopying] = useState(false)

  const handleCopy = async () => {
    if (isCopying) return

    setIsCopying(true)
    const inviteLink = `${window.location.origin}/session/${sessionId}`

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteLink)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = inviteLink
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          const successful = document.execCommand("copy")
          if (!successful) {
            throw new Error("execCommand failed")
          }
        } finally {
          document.body.removeChild(textArea)
        }
      }

      toast({
        title: "Invite link copied",
        description: "The invite link has been copied to your clipboard.",
      })
    } catch (error) {
      console.error("Failed to copy invite link:", error)
      toast({
        title: "Couldn't copy link",
        description: "Please copy manually: " + inviteLink,
        variant: "destructive",
      })
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      disabled={isCopying}
      variant={variant}
      size={size}
      className={cn(className)}
    >
      <Copy className="w-4 h-4" />
      {showLabel && <span>{label}</span>}
    </Button>
  )
}

