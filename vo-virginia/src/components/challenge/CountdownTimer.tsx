"use client"

import { useCountdownTimer } from "@/hooks/useCountdownTimer"

interface CountdownTimerProps {
  totalSeconds: number
  isRunning: boolean
  resetKey: string | number
  onTimeUp: () => void
  label?: string
}

export default function CountdownTimer({
  totalSeconds,
  isRunning,
  resetKey,
  onTimeUp,
  label = "Tempo restante",
}: CountdownTimerProps) {
  const remaining = useCountdownTimer({ totalSeconds, isRunning, resetKey, onTimeUp })

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const percentage = totalSeconds > 0 ? remaining / totalSeconds : 0

  const colorClass =
    percentage > 0.5
      ? "text-green-600"
      : percentage > 0.25
        ? "text-yellow-500"
        : "text-red-500"

  const isPulsing = remaining <= 10 && remaining > 0

  return (
    <div
      className={`font-display text-2xl font-bold tabular-nums ${colorClass} ${isPulsing ? "animate-pulse" : ""}`}
      role="timer"
      aria-label={label}
      aria-live="polite"
    >
      {minutes > 0 ? `${minutes}:${String(seconds).padStart(2, "0")}` : `${seconds}s`}
    </div>
  )
}
