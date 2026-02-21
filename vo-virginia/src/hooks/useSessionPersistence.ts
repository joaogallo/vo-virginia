"use client"

import { useEffect, useRef, useState } from "react"
import { useGameStore } from "@/stores/game-store"
import { saveSession, clearSession } from "@/lib/session-storage"
import type { PersistedSession } from "@/lib/session-storage"
import type { Operation } from "@/types/game"

const OPERATION_MAP: Record<Operation, string> = {
  addition: "ADDITION",
  subtraction: "SUBTRACTION",
  multiplication: "MULTIPLICATION",
  division: "DIVISION",
}

function buildSnapshot(): PersistedSession | null {
  const s = useGameStore.getState()
  if (!s.gameState) return null

  return {
    version: "2",
    savedAt: new Date().toISOString(),
    backendSessionId: s.backendSessionId,
    syncedAnswerCount: s.syncedAnswerCount,
    selectedOperations: s.selectedOperations,
    selectedNumbers: s.selectedNumbers,
    maxRetries: s.gameState.maxRetries,
    questionLimit: s.questionLimit,
    queue: s.gameState.queue,
    currentQuestion: s.gameState.currentQuestion,
    currentAttempt: s.gameState.currentAttempt,
    correctCount: s.gameState.correctCount,
    wrongCount: s.gameState.wrongCount,
    sessionTotal: s.gameState.sessionTotal,
    sessionStartTime: s.gameState.sessionStartTime,
    questionStartTime: s.gameState.questionStartTime,
    challengeMode: s.challengeMode,
    mode: s.gameState.mode,
    timeLimitSeconds: s.timeLimitSeconds,
    timeLimitPerQuestionSeconds: s.timeLimitPerQuestionSeconds,
    isInterrupted: s.isInterrupted,
    interruptedReason: s.interruptedReason,
    answerHistory: s.answerHistory,
  }
}

export function useSessionPersistence() {
  const [isSyncing, setIsSyncing] = useState(false)
  const lastSyncedCount = useRef(0)

  // Save to localStorage on every answer + sync new answers to backend
  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prevState) => {
      // Only act when answerHistory grows (new answer submitted)
      if (state.answerHistory.length <= prevState.answerHistory.length) return
      if (!state.gameState) return

      // 1. Immediately save full snapshot to localStorage
      const snapshot = buildSnapshot()
      if (snapshot) saveSession(snapshot)

      // 2. Send unsyncced answers to backend
      const sessionId = state.backendSessionId
      if (!sessionId) return

      const unsynced = state.answerHistory.slice(state.syncedAnswerCount)
      if (unsynced.length === 0) return

      setIsSyncing(true)

      const answers = unsynced.map((a) => ({
        operation: OPERATION_MAP[a.operation],
        firstOperand: a.displayFirst,
        secondOperand: a.displaySecond,
        correctAnswer: a.correctAnswer,
        userAnswer: a.userAnswer,
        isCorrect: a.isCorrect,
        attemptNumber: a.attemptNumber,
        timeSpentMs: a.timeSpentMs,
        answeredAt: a.answeredAt,
      }))

      fetch(`/api/sessoes/${sessionId}/respostas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })
        .then((res) => {
          if (res.ok) {
            const newCount = state.answerHistory.length
            useGameStore.getState().setSyncedAnswerCount(newCount)
            lastSyncedCount.current = newCount
            // Update localStorage with new synced count
            const updated = buildSnapshot()
            if (updated) saveSession(updated)
          }
        })
        .catch(() => {
          // Falha silenciosa — próxima resposta tenta enviar o acumulado
        })
        .finally(() => {
          setIsSyncing(false)
        })
    })

    return unsub
  }, [])

  // Save to localStorage on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const snapshot = buildSnapshot()
      if (snapshot) saveSession(snapshot)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  // Clear localStorage when session completes
  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.gameState?.isComplete) {
        clearSession()
      }
    })
    return unsub
  }, [])

  return { isSyncing }
}
