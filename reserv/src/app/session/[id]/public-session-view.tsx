"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Database } from "@/types/supabase";
import { SessionHero } from "@/components/session/session-hero";
import { ParticipantsList } from "@/components/session/participants-list";
import { LocationCard } from "@/components/session/location-card";
import { RSVPDock } from "@/components/session/rsvp-dock";
import { PaymentSection } from "@/components/session/payment-section";
import { Card } from "@/components/ui/card";
import { joinSession, leaveSession, uploadPaymentProof } from "./actions";

type Session = Database["public"]["Tables"]["sessions"]["Row"];
type Participant = Database["public"]["Tables"]["participants"]["Row"];

interface PublicSessionViewProps {
  session: Session;
  participants: Pick<Participant, "id" | "display_name">[];
  spotsLeft: number;
  hostName: string;
}

export function PublicSessionView({
  session,
  participants,
  spotsLeft,
  hostName,
}: PublicSessionViewProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const [paymentInView, setPaymentInView] = useState(false);

  // Mock price (not in schema)
  const price = 20;

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      // Prompt for name
      const displayName = prompt("Enter your name:");
      if (!displayName) {
        setIsJoining(false);
        return;
      }

      const result = await joinSession(session.id, {
        display_name: displayName,
        session_id: session.id,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("You've joined the session!");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to join session");
    } finally {
      setIsJoining(false);
    }
  };

  const handleDecline = () => {
    toast.info("You declined the invitation");
  };

  const handleUploadProof = async (file: File) => {
    setIsUploading(true);
    try {
      // In production, upload file to storage first, then create payment_proof record
      toast.info("Payment proof upload (mock - file storage not implemented)");
      
      // In production, get participant ID from current user's join state
      // For now, show error if no participant
      if (participants.length === 0) {
        toast.error("Please join the session first");
        setIsUploading(false);
        return;
      }
      
      const participantId = participants[0]?.id;
      if (participantId) {
        const result = await uploadPaymentProof(session.id, participantId, {
          session_id: session.id,
          participant_id: mockParticipantId,
          amount: price,
          currency: "RM",
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Payment proof uploaded!");
          router.refresh();
        }
      }
    } catch (error) {
      toast.error("Failed to upload payment proof");
    } finally {
      setIsUploading(false);
    }
  };

  // Check if payment section is in view (simplified)
  const shouldShowRSVP = spotsLeft > 0 && session.status === "open";

  return (
    <div className="min-h-screen pb-32 md:pb-8 sporty-bg">
      <div className="max-w-2xl mx-auto px-4 py-6" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <SessionHero
          session={session}
          hostName={hostName}
          spotsLeft={spotsLeft}
          price={price}
        />

        {session.description && (
          <Card className="glass-card-minimal p-6 mb-6 border-border/30">
            <h2 className="text-lg font-bold mb-3">About this session</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {session.description}
            </p>
          </Card>
        )}

        <LocationCard location={session.location} />

        <ParticipantsList
          participants={participants}
          spotsLeft={spotsLeft}
        />

        <div ref={paymentSectionRef}>
          <PaymentSection
            amount={price}
            bankAccount="Maybank • 1234 5678 9012"
            accountName={hostName}
            onUploadProof={handleUploadProof}
            isUploading={isUploading}
          />
        </div>
      </div>

      {shouldShowRSVP && (
        <RSVPDock
          visible={!paymentInView}
          onJoin={handleJoin}
          onDecline={handleDecline}
          isJoining={isJoining}
        />
      )}
    </div>
  );
}

