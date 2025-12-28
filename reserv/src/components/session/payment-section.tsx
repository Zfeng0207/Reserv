"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PaymentSectionProps {
  amount: number;
  currency?: string;
  bankAccount?: string;
  accountName?: string;
  onUploadProof: (file: File) => void;
  isUploading?: boolean;
}

export function PaymentSection({
  amount,
  currency = "RM",
  bankAccount,
  accountName,
  onUploadProof,
  isUploading = false,
}: PaymentSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadProof(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUploadProof(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <Accordion
        type="single"
        collapsible
        className="glass-card-minimal rounded-3xl overflow-hidden border-border/30"
      >
        <AccordionItem value="payment" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/20 transition-colors">
            <span className="text-lg font-bold">Payment & Proof Upload</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <Card className="bg-muted/30 border-border/20 p-6 rounded-2xl">
                <h3 className="font-bold mb-4 text-base">Payment Details</h3>
                <div className="space-y-3 text-sm">
                  {bankAccount && (
                    <div>
                      <p className="text-muted-foreground mb-1">Bank Account</p>
                      <p className="font-mono font-semibold">{bankAccount}</p>
                    </div>
                  )}
                  {accountName && (
                    <div>
                      <p className="text-muted-foreground mb-1">Account Name</p>
                      <p className="font-semibold">{accountName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-1">Amount</p>
                    <p className="font-bold text-2xl text-primary">
                      {currency} {amount}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <div className="w-40 h-40 bg-background rounded-2xl flex items-center justify-center border-2 border-dashed border-border/40">
                    <p className="text-xs text-muted-foreground">QR Code</p>
                  </div>
                </div>
              </Card>

              <div className="h-px bg-border/30" />

              <div>
                <p className="text-base font-bold mb-3">Upload Payment Proof</p>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/40 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-7 h-7 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(var(--primary), 0.3)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                disabled={isUploading}
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 font-semibold flex items-center justify-center gap-2 text-base disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                {isUploading ? "Uploading..." : "Submit Payment Proof"}
              </motion.button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

