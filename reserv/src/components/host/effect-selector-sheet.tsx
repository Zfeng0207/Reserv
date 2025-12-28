"use client";

import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EffectSelectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  effects: {
    grain: boolean;
    glow: boolean;
    vignette: boolean;
  };
  onEffectChange: (effect: keyof EffectSelectorSheetProps["effects"], value: boolean) => void;
}

export function EffectSelectorSheet({
  open,
  onOpenChange,
  effects,
  onEffectChange,
}: EffectSelectorSheetProps) {
  const handleToggle = (effect: keyof typeof effects, value: boolean) => {
    onEffectChange(effect, value);
    toast.success("Effect updated");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>Effects</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6 pb-4">
          {/* Grain */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="grain" className="text-base font-medium">
                Grain
              </Label>
              <p className="text-sm text-muted-foreground">
                Add a subtle texture overlay
              </p>
            </div>
            <Switch
              id="grain"
              checked={effects.grain}
              onCheckedChange={(checked) => handleToggle("grain", checked)}
            />
          </div>

          {/* Glow */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="glow" className="text-base font-medium">
                Glow
              </Label>
              <p className="text-sm text-muted-foreground">
                Add a soft glow effect to elements
              </p>
            </div>
            <Switch
              id="glow"
              checked={effects.glow}
              onCheckedChange={(checked) => handleToggle("glow", checked)}
            />
          </div>

          {/* Vignette */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="vignette" className="text-base font-medium">
                Vignette
              </Label>
              <p className="text-sm text-muted-foreground">
                Darken edges for focus
              </p>
            </div>
            <Switch
              id="vignette"
              checked={effects.vignette}
              onCheckedChange={(checked) => handleToggle("vignette", checked)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}



