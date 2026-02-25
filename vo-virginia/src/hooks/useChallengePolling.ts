"use client"

import { useCallback, useRef, useState } from "react"

interface PlayerProgress {
  id: string
  name: string
  correct: number
  wrong: number
  finished: boolean
  timeMs: number | null
  inactivity: boolean
}

interface ChallengeProgress {
  status: string
  totalQuestions: number
  challenger: PlayerProgress
  challenged: PlayerProgress
}

export function useChallengePolling(challengeId: string, intervalMs = 2500) {
  const [progress, setProgress] = useState<ChallengeProgress | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedRef = useRef(false)

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch(`/api/desafios-amigo/${challengeId}/progresso`)
      if (res.ok) {
        const data = await res.json()
        setProgress(data)
        return data
      }
    } catch {
      // silent
    }
    return null
  }, [challengeId])

  const start = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    fetchProgress()
    intervalRef.current = setInterval(fetchProgress, intervalMs)
  }, [fetchProgress, intervalMs])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startedRef.current = false
  }, [])

  return { progress, start, stop, refetch: fetchProgress }
}
