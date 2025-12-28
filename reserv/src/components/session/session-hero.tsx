"use client";

import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Database } from "@/types/supabase";
import { format } from "date-fns";

type SportType = Database["public"]["Enums"]["sport_type"];

const sportLabels: Record<SportType, string> = {
  badminton: "Badminton",
  pickleball: "Pickleball",
  volleyball: "Volleyball",
  futsal: "Futsal",
  other: "Other",
};

interface SessionHeroProps {
  session: {
    sport: SportType;
    title: string;
    start_at: string;
    end_at: string | null;
    location: string | null;
    capacity: number | null;
  };
  hostName?: string;
  hostAvatar?: string;
  spotsLeft: number;
  price?: number;
  coverImage?: string;
}

export function SessionHero({
  session,
  hostName = "Host",
  hostAvatar,
  spotsLeft,
  price,
  coverImage,
}: SessionHeroProps) {
  const startDate = new Date(session.start_at);
  const endDate = session.end_at ? new Date(session.end_at) : null;
  
  const dateStr = format(startDate, "MMM d, yyyy");
  const timeStr = endDate
    ? `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
    : format(startDate, "h:mm a");

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
            src={coverImage || "/pickleball-animated-sport-dynamic-energy.jpg"}
            alt="Session cover"
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        </div>

        {/* Content overlaid on image */}
        <div className="relative h-full flex flex-col justify-between p-6 md:p-8 text-white">
          {/* Top section: Sport badge */}
          <div className="flex items-start justify-between">
            <Badge className="bg-white/10 text-white border border-white/20 text-sm px-4 py-1.5 rounded-full font-medium backdrop-blur-sm">
              {sportLabels[session.sport] || session.sport}
            </Badge>
          </div>

          {/* Bottom section: Main event info */}
          <div className="space-y-6">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-balance leading-tight"
            >
              {session.title}
            </motion.h1>

            {/* Event details grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-3"
            >
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-white/80 flex-shrink-0" />
                <p className="text-base font-medium">
                  {dateStr} • {timeStr}
                </p>
              </div>

              {/* Venue */}
              {session.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-white/80 flex-shrink-0" />
                  <p className="text-base font-medium">{session.location}</p>
                </div>
              )}

              {/* Price */}
              {price !== undefined && price > 0 && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-white/80 flex-shrink-0" />
                  <p className="text-base font-medium">RM {price} per person</p>
                </div>
              )}

              {/* Spots left */}
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-white/80 flex-shrink-0" />
                <p className="text-base font-medium">
                  {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
                </p>
              </div>
            </motion.div>

            {/* Hosted by */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-3 pt-4 border-t border-white/20"
            >
              <Avatar className="w-10 h-10 border-2 border-white/30">
                <AvatarImage src={hostAvatar} alt="Host" />
                <AvatarFallback className="bg-white/20 text-white text-sm font-semibold backdrop-blur-sm">
                  {hostName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                Hosted by <span className="font-semibold">{hostName}</span>
              </span>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

