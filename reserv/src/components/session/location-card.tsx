"use client";

import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface LocationCardProps {
  location: string | null;
  mapEmbedUrl?: string;
}

export function LocationCard({ location, mapEmbedUrl }: LocationCardProps) {
  // Default map embed URL (Google Maps iframe)
  const defaultMapUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.715234567890!2d101.68123!3d3.20456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwMTInMTYuNCJOIDEwMcKwNDAnNTIuNCJF!5e0!3m2!1sen!2smy!4v1234567890";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="glass-card-minimal p-6 mb-6 border-border/30">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold">Location</h2>
        </div>
        {location && <p className="text-sm text-muted-foreground mb-4">{location}</p>}

        {/* Map preview only */}
        <div className="relative w-full h-48 rounded-2xl overflow-hidden">
          <iframe
            src={mapEmbedUrl || defaultMapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Session location"
          />
        </div>
      </Card>
    </motion.div>
  );
}

