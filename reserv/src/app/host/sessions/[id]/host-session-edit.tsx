"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Database } from "@/types/supabase";
import { EditorBottomBar } from "@/components/host/editor-bottom-bar";
import { ThemeSelectorSheet } from "@/components/host/theme-selector-sheet";
import { EffectSelectorSheet } from "@/components/host/effect-selector-sheet";
import { SessionHeroEdit } from "@/components/host/session-hero-edit";
import { SessionHero } from "@/components/session/session-hero";
import { ParticipantsList } from "@/components/session/participants-list";
import { LocationCard } from "@/components/session/location-card";
import { RSVPDock } from "@/components/session/rsvp-dock";
import { PaymentSection } from "@/components/session/payment-section";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveDraftSession, publishSession } from "./actions";
import { format } from "date-fns";
import { ThemePreset } from "@/components/host/theme-selector-sheet";

type Session = Database["public"]["Tables"]["sessions"]["Row"];

interface HostSessionEditProps {
  session: Session;
  initialPreviewMode?: boolean;
}

export function HostSessionEdit({ session: initialSession, initialPreviewMode = false }: HostSessionEditProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [previewMode, setPreviewMode] = useState(initialPreviewMode);
  const [isSaving, setIsSaving] = useState(false);
  
  // Theme and effect state
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>("badminton-green");
  const [effects, setEffects] = useState({
    grain: false,
    glow: false,
    vignette: false,
  });
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [effectSheetOpen, setEffectSheetOpen] = useState(false);

  // Sync preview mode with URL query parameter
  useEffect(() => {
    const mode = searchParams.get("mode");
    setPreviewMode(mode === "preview");
  }, [searchParams]);

  // Update URL when preview mode changes
  const handlePreviewModeChange = (isPreview: boolean) => {
    setPreviewMode(isPreview);
    const params = new URLSearchParams(searchParams.toString());
    if (isPreview) {
      params.set("mode", "preview");
    } else {
      params.delete("mode");
    }
    const queryString = params.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newPath, { scroll: false });
  };

  // Parse date/time from start_at
  const startDate = new Date(initialSession.start_at);
  const endDate = initialSession.end_at ? new Date(initialSession.end_at) : null;
  const dateStr = format(startDate, "MMM d, yyyy");
  const timeStr = endDate
    ? `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
    : format(startDate, "h:mm a");

  const [sessionData, setSessionData] = useState({
    sport: initialSession.sport,
    title: initialSession.title,
    date: dateStr,
    time: timeStr,
    venue: initialSession.location || "",
    description: initialSession.description || "",
    price: 0, // Price not in schema, using 0 as default
    capacity: initialSession.capacity || 8,
    coverImage: "/pickleball-animated-sport-dynamic-energy.jpg", // Mock for now
  });

  const handleUpdate = (updates: Partial<typeof sessionData>) => {
    setSessionData((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Keep existing dates for now (in production, parse date/time strings properly)
      const start_at = initialSession.start_at;
      const end_at = initialSession.end_at;

      const result = await saveDraftSession(initialSession.id, {
        title: sessionData.title,
        sport: sessionData.sport,
        location: sessionData.venue,
        description: sessionData.description,
        capacity: sessionData.capacity,
        start_at,
        end_at,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Draft saved");
      }
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEffectChange = (effect: keyof typeof effects, value: boolean) => {
    setEffects((prev) => ({ ...prev, [effect]: value }));
  };

  const handleCopyInviteLink = async () => {
    // Use /s/[code] route for shared links (for now using session ID as code)
    const inviteUrl = `${window.location.origin}/s/${initialSession.id}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied!");
    } catch (error) {
      toast.error("Failed to copy invite link");
    }
  };

  const handleCloseSession = () => {
    // TODO: Implement close session functionality
    toast.info("Close session (not implemented yet)");
  };

  // Mock participants data for preview (in production, fetch from DB)
  const mockParticipants: { id: string; display_name: string }[] = [];

  // Bottom bar height for padding calculation
  // Icon row (44px icons + 12px padding) + gap (12px) + button (48px) + container padding (24px) + safe area buffer
  const bottomBarHeight = 140;

  if (previewMode) {
    // Preview mode - show participant view
    return (
      <div className="min-h-screen sporty-bg">
        {/* Preview mode header */}
        <div
          className="fixed top-0 left-0 right-0 z-50 glass-card-minimal border-b border-border/50 backdrop-blur-xl"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                handlePreviewModeChange(false);
              }}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center"
            >
              ← Back to edit
            </button>
            <span className="text-sm font-medium text-muted-foreground">Previewing</span>
          </div>
        </div>

        <div
          className="max-w-2xl mx-auto px-4 py-6"
          style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top))" }}
        >
          <SessionHero
            session={{
              sport: sessionData.sport,
              title: sessionData.title,
              start_at: initialSession.start_at,
              end_at: initialSession.end_at,
              location: sessionData.venue,
              capacity: sessionData.capacity,
            }}
            spotsLeft={sessionData.capacity - mockParticipants.length}
            price={sessionData.price}
            coverImage={sessionData.coverImage}
          />

          {sessionData.description && (
            <Card className="glass-card-minimal p-6 mb-6 border-border/30">
              <h2 className="text-lg font-bold mb-3">About this session</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {sessionData.description}
              </p>
            </Card>
          )}

          <LocationCard location={sessionData.venue} />

          <ParticipantsList
            participants={mockParticipants}
            spotsLeft={sessionData.capacity - mockParticipants.length}
          />

          <PaymentSection
            amount={sessionData.price}
            onUploadProof={(file) => {
              console.log("Upload proof:", file);
              toast.info("Payment proof upload (mock)");
            }}
          />

          <RSVPDock
            visible={true}
            onJoin={() => toast.info("Join session (mock)")}
            onDecline={() => toast.info("Decline session (mock)")}
          />
        </div>
      </div>
    );
  }

  // Edit mode - show bottom editor bar
  return (
    <div className="min-h-screen sporty-bg">
      {/* Simple top nav - RESERV, Home, Login */}
      <div
        className="fixed top-0 left-0 right-0 z-50 glass-card-minimal border-b border-border/50 backdrop-blur-xl"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="text-base font-bold tracking-wider">RESERV</div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-3 py-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              Home
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-4 py-1.5 rounded-full min-h-[44px] flex items-center justify-center"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main content with bottom padding for editor bar */}
      <div
        className="max-w-2xl mx-auto px-4 py-6"
        style={{
          paddingTop: "calc(3.5rem + env(safe-area-inset-top))",
          paddingBottom: `calc(${bottomBarHeight}px + env(safe-area-inset-bottom))`,
        }}
      >
        {/* Apply effects to hero wrapper */}
        <div
          className={`${
            effects.grain ? "effect-grain" : ""
          } ${effects.glow ? "effect-glow" : ""} ${
            effects.vignette ? "effect-vignette" : ""
          }`}
        >
          <SessionHeroEdit
            sessionData={sessionData}
            onUpdate={handleUpdate}
            onCopyInviteLink={handleCopyInviteLink}
            onCloseSession={handleCloseSession}
          />
        </div>

        <Card className="glass-card-minimal p-6 mb-6 border-border/30">
          <h2 className="text-lg font-bold mb-3">About this session</h2>
          <Textarea
            value={sessionData.description}
            onChange={(e) => handleUpdate({ description: e.target.value })}
            className="minimal-input min-h-[100px] resize-none border-border/30"
            placeholder="Add a description..."
          />
        </Card>

        <LocationCard location={sessionData.venue} />
      </div>

      {/* Bottom editor bar - always show in edit mode */}
      <EditorBottomBar
        onThemeClick={() => setThemeSheetOpen(true)}
        onEffectClick={() => setEffectSheetOpen(true)}
        onPreviewClick={() => {
          handlePreviewModeChange(true);
        }}
        onSaveDraft={handleSaveDraft}
        isSaving={isSaving}
      />

      {/* Theme selector sheet */}
      <ThemeSelectorSheet
        open={themeSheetOpen}
        onOpenChange={setThemeSheetOpen}
        selectedTheme={selectedTheme}
        onThemeSelect={setSelectedTheme}
      />

      {/* Effect selector sheet */}
      <EffectSelectorSheet
        open={effectSheetOpen}
        onOpenChange={setEffectSheetOpen}
        effects={effects}
        onEffectChange={handleEffectChange}
      />
    </div>
  );
}
