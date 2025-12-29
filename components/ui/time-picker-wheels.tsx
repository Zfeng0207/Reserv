"use client"

import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerWheelsProps {
  hour: number // 1-12
  minute: number // 0-59 (in 5-minute increments)
  ampm: "AM" | "PM"
  onHourChange: (hour: number) => void
  onMinuteChange: (minute: number) => void
  onAmpmChange: (ampm: "AM" | "PM") => void
  uiMode?: "dark" | "light"
  className?: string
}

export function TimePickerWheels({
  hour,
  minute,
  ampm,
  onHourChange,
  onMinuteChange,
  onAmpmChange,
  uiMode = "dark",
  className,
}: TimePickerWheelsProps) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5) // 0, 5, 10, ..., 55
  const ampmOptions: ("AM" | "PM")[] = ["AM", "PM"]

  const isDark = uiMode === "dark"

  const handleIncrement = (type: "hour" | "minute" | "ampm") => {
    if (type === "hour") {
      const currentIndex = hours.indexOf(hour)
      const nextIndex = (currentIndex + 1) % hours.length
      onHourChange(hours[nextIndex])
    } else if (type === "minute") {
      const currentIndex = minutes.indexOf(minute)
      const nextIndex = (currentIndex + 1) % minutes.length
      onMinuteChange(minutes[nextIndex])
    } else if (type === "ampm") {
      onAmpmChange(ampm === "AM" ? "PM" : "AM")
    }
  }

  const handleDecrement = (type: "hour" | "minute" | "ampm") => {
    if (type === "hour") {
      const currentIndex = hours.indexOf(hour)
      const prevIndex = currentIndex === 0 ? hours.length - 1 : currentIndex - 1
      onHourChange(hours[prevIndex])
    } else if (type === "minute") {
      const currentIndex = minutes.indexOf(minute)
      const prevIndex = currentIndex === 0 ? minutes.length - 1 : currentIndex - 1
      onMinuteChange(minutes[prevIndex])
    } else if (type === "ampm") {
      onAmpmChange(ampm === "AM" ? "PM" : "AM")
    }
  }

  const renderPicker = (
    label: string,
    value: number | string,
    onIncrement: () => void,
    onDecrement: () => void,
    format: (val: number | string) => string
  ) => {
    return (
      <div className="flex flex-col items-center flex-1">
        <button
          onClick={onIncrement}
          className={cn(
            "p-1 rounded transition-colors",
            isDark ? "hover:bg-white/10 text-white/80" : "hover:bg-black/10 text-black/80"
          )}
          aria-label={`Increment ${label}`}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className={cn(
          "px-3 py-2 text-lg font-semibold min-w-[60px] text-center",
          isDark ? "text-white" : "text-black"
        )}>
          {format(value)}
        </div>
        <button
          onClick={onDecrement}
          className={cn(
            "p-1 rounded transition-colors",
            isDark ? "hover:bg-white/10 text-white/80" : "hover:bg-black/10 text-black/80"
          )}
          aria-label={`Decrement ${label}`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn("w-full flex gap-4 justify-center items-center", className)}>
      {renderPicker(
        "hour",
        hour,
        () => handleIncrement("hour"),
        () => handleDecrement("hour"),
        (val) => String(val)
      )}
      <div className={cn("text-xl font-semibold", isDark ? "text-white/60" : "text-black/60")}>
        :
      </div>
      {renderPicker(
        "minute",
        minute,
        () => handleIncrement("minute"),
        () => handleDecrement("minute"),
        (val) => String(val).padStart(2, "0")
      )}
      {renderPicker(
        "ampm",
        ampm,
        () => handleIncrement("ampm"),
        () => handleDecrement("ampm"),
        (val) => String(val)
      )}
    </div>
  )
}
