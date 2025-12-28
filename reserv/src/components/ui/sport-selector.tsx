"use client";

import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database } from "@/types/supabase";

type SportType = Database["public"]["Enums"]["sport_type"];

const sportLabels: Record<SportType, string> = {
  badminton: "Badminton",
  pickleball: "Pickleball",
  volleyball: "Volleyball",
  futsal: "Futsal",
  other: "Other",
};

const sportOptions: SportType[] = ["badminton", "pickleball", "volleyball", "futsal"];

interface SportSelectorProps {
  value: SportType;
  onValueChange: (value: SportType) => void;
  className?: string;
}

export function SportSelector({ value, onValueChange, className }: SportSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-2 ${className || ""}`}
        >
          <Badge className="bg-white/10 text-white border border-white/20 text-sm px-4 py-1.5 rounded-full font-medium backdrop-blur-sm">
            {sportLabels[value] || value}
          </Badge>
          <ChevronDown className="w-4 h-4 text-white/80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[120px]">
        {sportOptions.map((sport) => (
          <DropdownMenuItem
            key={sport}
            onClick={() => onValueChange(sport)}
            className={value === sport ? "bg-accent" : ""}
          >
            {sportLabels[sport]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

