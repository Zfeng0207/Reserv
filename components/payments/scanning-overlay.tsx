"use client"

import { motion, AnimatePresence } from "framer-motion"

interface ScanningOverlayProps {
  open: boolean
}

export function ScanningOverlay({ open }: ScanningOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* RESERV Logo placeholder - replace with actual logo component/image */}
            <motion.div
              className="mx-auto mb-4 h-12 w-12 rounded-full border border-white/10 bg-white/10 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            >
              <span className="text-white/60 text-xs font-semibold">R</span>
            </motion.div>

            <div className="text-base font-semibold text-white">
              AI is scanning your details…
            </div>
            <div className="mt-1 text-sm text-white/70">
              Extracting bank name, account number & account name
            </div>

            <motion.div
              className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
              initial={{ opacity: 0.9 }}
            >
              <motion.div
                className="h-full w-1/3 rounded-full bg-white/50"
                animate={{ x: ["-40%", "240%"] }}
                transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

