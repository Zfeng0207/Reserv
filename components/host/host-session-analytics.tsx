"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PieChart } from "reaviz"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Eye, Users, UserCheck, UserX, Clock } from "lucide-react"

interface HostSessionAnalyticsProps {
  sessionId: string
  uiMode: "dark" | "light"
}

interface AnalyticsData {
  attendance: {
    accepted: number
    capacity: number
    declined: number
    unanswered: number
  }
  payments: {
    collected: number
    total: number
    paidCount: number
  }
  acceptedList: Array<{ id: string; display_name: string; created_at: string }>
  declinedList: Array<{ id: string; display_name: string; created_at: string }>
  viewedCount: number
  pricePerPerson: number | null
}

export function HostSessionAnalytics({ sessionId, uiMode }: HostSessionAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { getSessionAnalytics } = await import("@/app/host/sessions/[id]/actions")
        const result = await getSessionAnalytics(sessionId)
        if (result.ok) {
          setAnalytics({
            attendance: result.attendance,
            payments: result.payments,
            acceptedList: result.acceptedList,
            declinedList: result.declinedList,
            viewedCount: result.viewedCount,
            pricePerPerson: result.pricePerPerson,
          })
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [sessionId])

  const glassCard = uiMode === "dark"
    ? "bg-black/30 border-white/20 text-white backdrop-blur-sm"
    : "bg-white/70 border-black/10 text-black backdrop-blur-sm"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={cn("text-sm", uiMode === "dark" ? "text-white/60" : "text-black/60")}>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className={cn("text-sm", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
          Failed to load analytics
        </p>
      </div>
    )
  }

  // Prepare pie chart data
  const attendanceData = [
    { key: "Accepted", data: analytics.attendance.accepted },
    { key: "Remaining", data: Math.max(0, analytics.attendance.capacity - analytics.attendance.accepted) },
  ].filter((item) => item.data > 0)

  const paymentData = analytics.payments.total > 0
    ? [
        { key: "Collected", data: analytics.payments.collected },
        { key: "Remaining", data: Math.max(0, analytics.payments.total - analytics.payments.collected) },
      ].filter((item) => item.data > 0)
    : []

  return (
    <div className={cn("min-h-screen", uiMode === "dark" ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-white")}>
      <div className="space-y-6 p-4 pb-24">
      {/* Pie Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Attendance Pie Chart */}
          <Card className={cn("p-4", glassCard)}>
            <h3 className={cn("text-sm font-semibold mb-3", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
              Attendance
            </h3>
            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-48 flex items-center justify-center">
                {analytics.attendance.capacity > 0 ? (
                  <PieChart
                    data={attendanceData}
                    height={192}
                    colorScheme={uiMode === "dark" ? ["#84cc16", "#64748b"] : ["#84cc16", "#cbd5e1"]}
                  />
                ) : (
                  <div className={cn("text-sm", uiMode === "dark" ? "text-white/40" : "text-black/40")}>
                    No capacity set
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className={cn("text-2xl font-bold", uiMode === "dark" ? "text-white" : "text-black")}>
                  {analytics.attendance.accepted}/{analytics.attendance.capacity || 0}
                </p>
                <p className={cn("text-xs mt-1", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
                  Accepted / Capacity
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Pie Chart */}
          <Card className={cn("p-4", glassCard)}>
            <h3 className={cn("text-sm font-semibold mb-3", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
              Payments
            </h3>
            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-48 flex items-center justify-center">
                {analytics.payments.total > 0 ? (
                  <PieChart
                    data={paymentData}
                    height={192}
                    colorScheme={uiMode === "dark" ? ["#10b981", "#64748b"] : ["#10b981", "#cbd5e1"]}
                  />
                ) : (
                  <div className={cn("text-sm", uiMode === "dark" ? "text-white/40" : "text-black/40")}>
                    No payments
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className={cn("text-2xl font-bold", uiMode === "dark" ? "text-white" : "text-black")}>
                  RM{analytics.payments.collected.toFixed(0)}/{analytics.payments.total.toFixed(0)}
                </p>
                <p className={cn("text-xs mt-1", uiMode === "dark" ? "text-white/60" : "text-black/60")}>
                  Collected / Total
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Live Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className={cn("p-4", glassCard)}>
          <h3 className={cn("text-sm font-semibold mb-4", uiMode === "dark" ? "text-white/90" : "text-black/90")}>
            Live Activity
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  uiMode === "dark" ? "bg-white/10" : "bg-black/10"
                )}
              >
                <Eye className={cn("w-5 h-5", uiMode === "dark" ? "text-white/80" : "text-black/80")} />
              </div>
              <div>
                <p className={cn("text-xs", uiMode === "dark" ? "text-white/60" : "text-black/60")}>Viewed</p>
                <p className={cn("text-lg font-semibold", uiMode === "dark" ? "text-white" : "text-black")}>
                  {analytics.viewedCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  uiMode === "dark" ? "bg-white/10" : "bg-black/10"
                )}
              >
                <Clock className={cn("w-5 h-5", uiMode === "dark" ? "text-white/80" : "text-black/80")} />
              </div>
              <div>
                <p className={cn("text-xs", uiMode === "dark" ? "text-white/60" : "text-black/60")}>Unanswered</p>
                <p className={cn("text-lg font-semibold", uiMode === "dark" ? "text-white" : "text-black")}>
                  {analytics.attendance.unanswered}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  uiMode === "dark" ? "bg-white/10" : "bg-black/10"
                )}
              >
                <UserCheck className={cn("w-5 h-5", uiMode === "dark" ? "text-white/80" : "text-black/80")} />
              </div>
              <div>
                <p className={cn("text-xs", uiMode === "dark" ? "text-white/60" : "text-black/60")}>Accepted</p>
                <p className={cn("text-lg font-semibold", uiMode === "dark" ? "text-white" : "text-black")}>
                  {analytics.attendance.accepted}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  uiMode === "dark" ? "bg-white/10" : "bg-black/10"
                )}
              >
                <UserX className={cn("w-5 h-5", uiMode === "dark" ? "text-white/80" : "text-black/80")} />
              </div>
              <div>
                <p className={cn("text-xs", uiMode === "dark" ? "text-white/60" : "text-black/60")}>Declined</p>
                <p className={cn("text-lg font-semibold", uiMode === "dark" ? "text-white" : "text-black")}>
                  {analytics.attendance.declined}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Lists Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className={cn("p-4", glassCard)}>
          <Tabs defaultValue="accepted" className="w-full">
            <TabsList className={cn("grid w-full grid-cols-2", uiMode === "dark" ? "bg-white/5" : "bg-black/5")}>
              <TabsTrigger
                value="accepted"
                className={cn(
                  "data-[state=active]:bg-white/10 data-[state=active]:text-white",
                  uiMode === "dark" ? "text-white/60" : "text-black/60"
                )}
              >
                Accepted ({analytics.acceptedList.length})
              </TabsTrigger>
              <TabsTrigger
                value="declined"
                className={cn(
                  "data-[state=active]:bg-white/10 data-[state=active]:text-white",
                  uiMode === "dark" ? "text-white/60" : "text-black/60"
                )}
              >
                Declined ({analytics.declinedList.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="accepted" className="mt-4 space-y-2">
              {analytics.acceptedList.length > 0 ? (
                analytics.acceptedList.map((participant) => (
                  <div
                    key={participant.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      uiMode === "dark" ? "bg-white/5" : "bg-black/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
                          uiMode === "dark" ? "bg-white/10 text-white" : "bg-black/10 text-black"
                        )}
                      >
                        {participant.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", uiMode === "dark" ? "text-white" : "text-black")}>
                          {participant.display_name}
                        </p>
                        <p className={cn("text-xs", uiMode === "dark" ? "text-white/50" : "text-black/50")}>
                          {new Date(participant.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className={cn("text-sm text-center py-8", uiMode === "dark" ? "text-white/40" : "text-black/40")}>
                  No accepted participants yet
                </p>
              )}
            </TabsContent>
            <TabsContent value="declined" className="mt-4 space-y-2">
              {analytics.declinedList.length > 0 ? (
                analytics.declinedList.map((participant) => (
                  <div
                    key={participant.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      uiMode === "dark" ? "bg-white/5" : "bg-black/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
                          uiMode === "dark" ? "bg-white/10 text-white" : "bg-black/10 text-black"
                        )}
                      >
                        {participant.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", uiMode === "dark" ? "text-white" : "text-black")}>
                          {participant.display_name}
                        </p>
                        <p className={cn("text-xs", uiMode === "dark" ? "text-white/50" : "text-black/50")}>
                          {new Date(participant.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className={cn("text-sm text-center py-8", uiMode === "dark" ? "text-white/40" : "text-black/40")}>
                  No declined participants
                </p>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
    </div>
  )
}

