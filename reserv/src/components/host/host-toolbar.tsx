"use client";

import { Palette, Sparkles, Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface HostToolbarProps {
  onPublish: () => void;
  onSaveDraft: () => void;
  isPublishing?: boolean;
  isSaving?: boolean;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export function HostToolbar({
  onPublish,
  onSaveDraft,
  isPublishing = false,
  isSaving = false,
  activeTab = "theme",
  onTabChange,
}: HostToolbarProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card-minimal border-b border-border/50 backdrop-blur-xl"
      style={{
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabsTrigger
              value="theme"
              className="data-[state=active]:bg-background/50 data-[state=active]:text-foreground"
            >
              <Palette className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger
              value="effect"
              className="data-[state=active]:bg-background/50 data-[state=active]:text-foreground"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Effect</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-background/50 data-[state=active]:text-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-background/50 data-[state=active]:text-foreground"
            >
              <Eye className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSaving || isPublishing}
            className="glass-button-minimal"
          >
            {isSaving ? "Saving..." : "Save draft"}
          </Button>
          <Button
            size="sm"
            onClick={onPublish}
            disabled={isPublishing || isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

