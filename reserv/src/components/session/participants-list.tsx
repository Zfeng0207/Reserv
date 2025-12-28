"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Participant {
  id: string;
  display_name: string;
  avatar?: string | null;
}

interface ParticipantsListProps {
  participants: Participant[];
  spotsLeft: number;
  onViewAll?: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function ParticipantsList({
  participants,
  spotsLeft,
  onViewAll,
}: ParticipantsListProps) {
  const joinedCount = participants.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="glass-card-minimal p-6 mb-6 border-border/30">
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-1">Guest list</h2>
          <p className="text-sm text-muted-foreground">
            {joinedCount} going · {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
          </p>
        </div>

        {/* Horizontal scrolling avatars with overlap */}
        {participants.length > 0 && (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
              {participants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  whileHover={{ scale: 1.1, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                  style={{ marginLeft: index > 0 ? "-12px" : "0" }}
                >
                  <Avatar className="w-16 h-16 border-4 border-card shadow-lg ring-2 ring-primary/20">
                    <AvatarImage src={participant.avatar || undefined} alt={participant.display_name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/80 to-secondary/80 text-white font-bold text-lg">
                      {getInitials(participant.display_name)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* View all button */}
        {onViewAll && (
          <Button
            variant="ghost"
            className="w-full mt-4 text-sm font-medium text-primary hover:text-primary/80"
            onClick={onViewAll}
          >
            View all guests
          </Button>
        )}
      </Card>
    </motion.div>
  );
}

