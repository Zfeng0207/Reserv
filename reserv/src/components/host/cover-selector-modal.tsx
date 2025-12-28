"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/tailwind";

// Placeholder cover images (mock data)
const coverOptions = [
  { id: "1", url: "/pickleball-animated-sport-dynamic-energy.jpg", label: "Pickleball" },
  { id: "2", url: "/placeholder.svg?height=400&width=600", label: "Badminton Court" },
  { id: "3", url: "/placeholder.svg?height=400&width=600", label: "Volleyball" },
  { id: "4", url: "/placeholder.svg?height=400&width=600", label: "Futsal Field" },
  { id: "5", url: "/placeholder.svg?height=400&width=600", label: "Tennis" },
  { id: "6", url: "/placeholder.svg?height=400&width=600", label: "Basketball" },
  { id: "7", url: "/placeholder.svg?height=400&width=600", label: "Soccer" },
  { id: "8", url: "/placeholder.svg?height=400&width=600", label: "Swimming" },
  { id: "9", url: "/placeholder.svg?height=400&width=600", label: "Running" },
  { id: "10", url: "/placeholder.svg?height=400&width=600", label: "Cycling" },
  { id: "11", url: "/placeholder.svg?height=400&width=600", label: "Gym" },
  { id: "12", url: "/placeholder.svg?height=400&width=600", label: "Yoga" },
];

interface CoverSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCover?: string;
  onSelectCover: (coverUrl: string) => void;
}

export function CoverSelectorModal({
  open,
  onOpenChange,
  selectedCover,
  onSelectCover,
}: CoverSelectorModalProps) {
  const handleSelect = (coverUrl: string) => {
    onSelectCover(coverUrl);
    onOpenChange(false);
    toast.success("Cover updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a cover</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <div className="grid grid-cols-2 gap-4 pb-4">
            {coverOptions.map((cover) => (
              <button
                key={cover.id}
                type="button"
                onClick={() => handleSelect(cover.url)}
                className={cn(
                  "relative aspect-video rounded-xl overflow-hidden border-2 transition-all",
                  selectedCover === cover.url
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                )}
              >
                <img
                  src={cover.url}
                  alt={cover.label}
                  className="w-full h-full object-cover"
                />
                {selectedCover === cover.url && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Selected
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

