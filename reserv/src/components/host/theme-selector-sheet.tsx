"use client";

import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils/tailwind";

export type ThemePreset = "badminton-green" | "pickleball-sunset" | "midnight" | "clean-light";

const themePresets: { id: ThemePreset; label: string; color: string }[] = [
  { id: "badminton-green", label: "Badminton Green", color: "oklch(0.75 0.18 145)" },
  { id: "pickleball-sunset", label: "Pickleball Sunset", color: "oklch(0.65 0.15 195)" },
  { id: "midnight", label: "Midnight", color: "oklch(0.7 0.2 295)" },
  { id: "clean-light", label: "Clean Light", color: "oklch(0.82 0.12 80)" },
];

interface ThemeSelectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTheme?: ThemePreset;
  onThemeSelect: (theme: ThemePreset) => void;
}

export function ThemeSelectorSheet({
  open,
  onOpenChange,
  selectedTheme = "badminton-green",
  onThemeSelect,
}: ThemeSelectorSheetProps) {
  const handleSelect = (theme: ThemePreset) => {
    onThemeSelect(theme);
    onOpenChange(false);
    toast.success("Theme updated");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>Choose Theme</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4 mt-6 pb-4">
          {themePresets.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelect(theme.id)}
              className={cn(
                "relative aspect-video rounded-xl overflow-hidden border-2 transition-all p-4 flex flex-col items-start justify-end",
                selectedTheme === theme.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
              style={{
                backgroundColor: theme.color,
              }}
            >
              <span className="text-sm font-semibold text-white drop-shadow-lg">
                {theme.label}
              </span>
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                  Selected
                </div>
              )}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

