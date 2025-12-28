"use client";

import { useState } from "react";
import { Calendar, MapPin, Users, DollarSign, Upload, Copy, X } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SportSelector } from "@/components/ui/sport-selector";
import { CoverSelectorModal } from "./cover-selector-modal";
import { Database } from "@/types/supabase";

type SportType = Database["public"]["Enums"]["sport_type"];

interface SessionHeroEditProps {
  sessionData: {
    sport: SportType;
    title: string;
    date: string;
    time: string;
    venue: string;
    price: number;
    capacity: number;
    coverImage?: string;
  };
  onUpdate: (updates: Partial<SessionHeroEditProps["sessionData"]>) => void;
  onCopyInviteLink?: () => void;
  onCloseSession?: () => void;
}

export function SessionHeroEdit({
  sessionData,
  onUpdate,
  onCopyInviteLink,
  onCloseSession,
}: SessionHeroEditProps) {
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  const handleSportChange = (sport: SportType) => {
    onUpdate({ sport });
  };

  const handleCoverSelect = (coverUrl: string) => {
    onUpdate({ coverImage: coverUrl });
  };

  const handleDateTimeChange = (value: string) => {
    const [date, time] = value.split(" • ");
    onUpdate({ date: date || sessionData.date, time: time || sessionData.time });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-6 -mx-4 md:mx-0"
    >
      <Card className="relative h-[85vh] md:h-[70vh] min-h-[600px] rounded-none md:rounded-3xl overflow-hidden border-none">
        {/* Cover image background */}
        <div className="absolute inset-0">
          <img
            src={sessionData.coverImage || "/pickleball-animated-sport-dynamic-energy.jpg"}
            alt="Session cover"
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        </div>

        {/* Content overlaid on image */}
        <div className="relative h-full flex flex-col justify-between p-6 md:p-8 text-white">
          {/* Top section: Sport selector and change cover button */}
          <div className="flex items-start justify-between">
            <SportSelector
              value={sessionData.sport}
              onValueChange={handleSportChange}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={() => setCoverModalOpen(true)}
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              Change cover
            </motion.button>
          </div>

          {/* Bottom section: Main event info */}
          <div className="space-y-6">
            {/* Title - inline editable */}
            <Input
              value={sessionData.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="text-4xl md:text-5xl font-bold bg-transparent border-0 border-b border-white/30 text-white placeholder:text-white/60 rounded-none px-0 focus-visible:ring-0 focus-visible:border-white/50 h-auto py-2"
              placeholder="Session title"
            />

            {/* Event details grid */}
            <div className="space-y-3">
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-white/80 flex-shrink-0" />
                <Input
                  value={`${sessionData.date} • ${sessionData.time}`}
                  onChange={(e) => handleDateTimeChange(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm flex-1 min-h-[44px]"
                  placeholder="Dec 27, 2024 • 7:00 PM - 9:00 PM"
                />
              </div>

              {/* Venue */}
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white/80 flex-shrink-0" />
                <Input
                  value={sessionData.venue}
                  onChange={(e) => onUpdate({ venue: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm flex-1 min-h-[44px]"
                  placeholder="Venue address"
                />
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-white/80 flex-shrink-0" />
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-base">RM</span>
                  <Input
                    type="number"
                    value={sessionData.price}
                    onChange={(e) => onUpdate({ price: Number(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm w-24 min-h-[44px]"
                  />
                  <span className="text-sm text-white/80">per person</span>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-white/80 flex-shrink-0" />
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="number"
                    value={sessionData.capacity}
                    onChange={(e) => onUpdate({ capacity: Number(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm w-20 min-h-[44px]"
                  />
                  <span className="text-sm text-white/80">spots total</span>
                </div>
              </div>
            </div>

            {/* Edit mode actions */}
            <div className="flex flex-col gap-2 pt-4">
              {onCopyInviteLink && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onClick={onCopyInviteLink}
                  className="bg-white/10 border border-white/20 text-white backdrop-blur-sm px-4 py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Copy className="w-4 h-4" />
                  Copy invite link
                </motion.button>
              )}
              {onCloseSession && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onClick={onCloseSession}
                  className="bg-red-500/20 border border-red-500/30 text-red-100 backdrop-blur-sm px-4 py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <X className="w-4 h-4" />
                  Close session
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <CoverSelectorModal
        open={coverModalOpen}
        onOpenChange={setCoverModalOpen}
        selectedCover={sessionData.coverImage}
        onSelectCover={handleCoverSelect}
      />
    </motion.div>
  );
}

