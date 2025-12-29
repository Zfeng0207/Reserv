"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TopNav } from "@/components/top-nav"

export default function HomePage() {
  const router = useRouter()

  const handleContinueAsGuest = (name: string) => {
    // Guest name is already stored in localStorage by LoginDialog
    // Navigate to create session page
    router.push("/host/sessions/new/edit")
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Navigation */}
      <TopNav showCreateNow={true} onContinueAsGuest={handleContinueAsGuest} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 text-balance">
              One link to organize your sports session
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto text-pretty">
              Create beautiful event invites, collect RSVPs, and track payments—all without requiring your guests to
              sign up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-medium rounded-full h-14 px-8 text-lg shadow-lg shadow-lime-500/20"
              >
                <Link href="/host/sessions/new/edit">
                  Create a session
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full h-14 px-8 text-lg"
              >
                <Link href="/s/demo">View demo invite</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-lg text-white/60">Three simple steps to organized sessions</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Host creates",
                description: "Set up your event details, pricing, and payment info in minutes. No login required.",
              },
              {
                step: "2",
                title: "Share link",
                description: "Send one simple link to your group. Works on any device, no app download needed.",
              },
              {
                step: "3",
                title: "Guests RSVP & pay",
                description: "Participants confirm attendance and upload payment proof. Track everything in one place.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card className="border-white/10 bg-black/20 backdrop-blur-sm p-8 h-full">
                  <div className="w-12 h-12 rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30 flex items-center justify-center text-xl font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RESERV */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why RESERV</h2>
            <p className="text-lg text-white/60">Built for simplicity and speed</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Check,
                title: "No login for guests",
                description: "Your friends can RSVP instantly without creating an account.",
              },
              {
                icon: Zap,
                title: "Reduces follow-ups",
                description: "One shared link means fewer messages chasing confirmations and payments.",
              },
              {
                icon: Check,
                title: "Clear paid status",
                description: "See who's confirmed and who's paid at a glance. No spreadsheets needed.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Card className="border-white/10 bg-black/20 backdrop-blur-sm p-8 h-full">
                  <item.icon className="w-10 h-10 text-lime-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border-white/10 bg-gradient-to-br from-lime-500/10 to-emerald-500/10 backdrop-blur-sm p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-lg text-white/70 mb-8">Create your first session in under a minute</p>
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-medium rounded-full h-14 px-8 text-lg shadow-lg shadow-lime-500/20"
              >
                <Link href="/host/sessions/new/edit">
                  Create a session
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="mx-auto max-w-7xl text-center text-white/40 text-sm">© 2025 RESERV. All rights reserved.</div>
      </footer>
    </div>
  )
}
