"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface RSVPDockProps {
  visible: boolean;
  onJoin: () => void;
  onDecline: () => void;
  isJoining?: boolean;
}

export function RSVPDock({ visible, onJoin, onDecline, isJoining }: RSVPDockProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 glass-card-minimal border-t border-border/50 backdrop-blur-xl"
          style={{
            paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
          }}
        >
          <div className="max-w-2xl mx-auto px-4 pt-4 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(var(--primary), 0.4)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={onJoin}
              disabled={isJoining}
              className="flex-1 bg-primary text-primary-foreground rounded-full py-4 font-bold text-base shadow-lg min-h-[56px] disabled:opacity-50"
            >
              {isJoining ? "Joining..." : "Join Session"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={onDecline}
              disabled={isJoining}
              className="px-8 glass-button-minimal rounded-full py-4 font-semibold text-base bg-background/50 min-h-[56px] disabled:opacity-50"
            >
              Decline
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

