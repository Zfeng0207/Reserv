"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileCalendarProps {
  value: Date | null
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  mode?: "single"
  className?: string
  uiMode?: "dark" | "light"
}

export function MobileCalendar({
  value,
  onChange,
  minDate,
  maxDate,
  mode = "single",
  className,
  uiMode = "dark",
}: MobileCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Initialize displayMonth to current month of value, or today's month
  const getInitialMonth = () => {
    if (value) {
      return new Date(value.getFullYear(), value.getMonth(), 1)
    }
    return new Date(today.getFullYear(), today.getMonth(), 1)
  }

  const [displayMonth, setDisplayMonth] = useState<Date>(getInitialMonth())

  // Update displayMonth when value changes (if value is in a different month)
  useEffect(() => {
    if (value) {
      const valueMonth = new Date(value.getFullYear(), value.getMonth(), 1)
      const currentDisplayMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1)
      if (valueMonth.getTime() !== currentDisplayMonth.getTime()) {
        setDisplayMonth(valueMonth)
      }
    }
  }, [value])

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    return firstDay.getDay()
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const isToday = (date: Date) => {
    return isSameDay(date, today)
  }

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const handleDayClick = (day: number) => {
    const newDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
    if (!isDisabled(newDate)) {
      onChange(newDate)
    }
  }

  const handlePrevMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))
  }

  const daysInMonth = getDaysInMonth(displayMonth)
  const firstDay = getFirstDayOfMonth(displayMonth)
  const days: (number | null)[] = []

  // Add leading blanks
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const isDark = uiMode === "dark"

  return (
    <div className={cn("w-full", className)}>
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-black"}`}>
          {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10 text-white/80" : "hover:bg-black/10 text-black/80"} transition-colors`}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10 text-white/80" : "hover:bg-black/10 text-black/80"} transition-colors`}
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className={`text-center text-xs font-medium ${isDark ? "text-white/60" : "text-black/60"} py-1`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`blank-${index}`} className="aspect-square" />
          }

          const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
          const selected = value && isSameDay(date, value)
          const disabled = isDisabled(date)
          const isTodayDate = isToday(date)

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={disabled}
              className={cn(
                "aspect-square rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                disabled && (isDark ? "text-white/30 cursor-not-allowed" : "text-black/30 cursor-not-allowed"),
                !disabled && !selected && isDark && "text-white/80 hover:bg-white/10",
                !disabled && !selected && !isDark && "text-black/80 hover:bg-black/10",
                selected && "bg-lime-500 text-black font-semibold",
                !selected && isTodayDate && !disabled && (isDark ? "ring-2 ring-white/30" : "ring-2 ring-black/30")
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

