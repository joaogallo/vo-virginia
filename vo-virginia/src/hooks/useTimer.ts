"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export function useTimer(isRunning: boolean, resetKey: string | number) {
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef<number>(Date.now())
  const rafRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    if (!isRunning) return
    setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    rafRef.current = requestAnimationFrame(tick)
  }, [isRunning])

  // Reset quando resetKey muda (nova questão)
  useEffect(() => {
    startTimeRef.current = Date.now()
    setElapsed(0)
  }, [resetKey])

  // Iniciar/parar o timer
  useEffect(() => {
    if (isRunning) {
      rafRef.current = requestAnimationFrame(tick)
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isRunning, tick])

  return elapsed
}
