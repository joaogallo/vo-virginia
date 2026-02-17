"use client"

import { useTimer } from "@/hooks/useTimer"

interface GameTimerProps {
  isRunning: boolean
  resetKey: string | number
}

export default function GameTimer({ isRunning, resetKey }: GameTimerProps) {
  const elapsed = useTimer(isRunning, resetKey)

  const color =
    elapsed < 10
      ? "text-green-600"
      : elapsed < 30
        ? "text-yellow-600"
        : "text-red-600"

  return (
    <div className={`font-display text-2xl sm:text-3xl font-bold ${color} transition-colors duration-500`}>
      <span className="tabular-nums">{elapsed}</span>
      <span className="text-lg sm:text-xl ml-1">s</span>
    </div>
  )
}
