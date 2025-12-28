"use client";

import { Palette, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EditorBottomBarProps {
  onThemeClick: () => void;
  onEffectClick: () => void;
  onPreviewClick: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function EditorBottomBar({
  onThemeClick,
  onEffectClick,
  onPreviewClick,
  onSaveDraft,
  isSaving = false,
}: EditorBottomBarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] bg-background border-t border-border shadow-2xl"
      style={{
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Icon buttons row */}
        <div className="flex items-center justify-center gap-8 mb-4">
          {/* Theme button */}
          <button
            type="button"
            onClick={onThemeClick}
            className="flex flex-col items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center"
          >
            <Palette className="w-5 h-5 text-foreground" />
            <span className="text-xs font-medium text-foreground/80">Theme</span>
          </button>

          {/* Effect button */}
          <button
            type="button"
            onClick={onEffectClick}
            className="flex flex-col items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center relative"
          >
            <Sparkles className="w-5 h-5 text-foreground" />
            <span className="text-xs font-medium text-foreground/80 flex items-center gap-1">
              Effect
              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4">
                NEW
              </Badge>
            </span>
          </button>

          {/* Preview button */}
          <button
            type="button"
            onClick={onPreviewClick}
            className="flex flex-col items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center"
          >
            <Eye className="w-5 h-5 text-foreground" />
            <span className="text-xs font-medium text-foreground/80">Preview</span>
          </button>
        </div>

        {/* Save draft button */}
        <Button
          onClick={onSaveDraft}
          disabled={isSaving}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
        >
          {isSaving ? "Saving..." : "Save draft"}
        </Button>
      </div>
    </div>
  );
}

