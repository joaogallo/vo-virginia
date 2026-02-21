"use client"

import { useState, useEffect, useRef } from "react"

interface UseCountdownTimerOptions {
  totalSeconds: number
  isRunning: boolean
  resetKey: string | number
  onTimeUp: () => void
}

export function useCountdownTimer({
  totalSeconds,
  isRunning,
  resetKey,
  onTimeUp,
}: UseCountdownTimerOptions): number {
  const [remaining, setRemaining] = useState(totalSeconds)
  const rafRef = useRef<number | null>(null)
  const firedRef = useRef(false)
  const onTimeUpRef = useRef(onTimeUp)
  const isRunningRef = useRef(isRunning)
  const startTimeRef = useRef(0)
  const totalSecondsRef = useRef(totalSeconds)

  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  useEffect(() => {
    totalSecondsRef.current = totalSeconds
  }, [totalSeconds])

  // Timer loop - restarts when isRunning/resetKey/totalSeconds changes
  useEffect(() => {
    if (!isRunning || firedRef.current) return

    startTimeRef.current = Date.now()
    firedRef.current = false

    function tick() {
      if (!isRunningRef.current) return
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const left = Math.max(0, totalSecondsRef.current - elapsed)
      setRemaining(Math.ceil(left))
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        onTimeUpRef.current()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isRunning, resetKey, totalSeconds])

  return remaining
}
