"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/stores/game-store"
import { clearSession } from "@/lib/session-storage"
import SessionSummary from "@/components/game/SessionSummary"
import type { Operation } from "@/types/game"

const OPERATION_MAP: Record<Operation, string> = {
  addition: "ADDITION",
  subtraction: "SUBTRACTION",
  multiplication: "MULTIPLICATION",
  division: "DIVISION",
}

export default function ResultadoPage() {
  const router = useRouter()
  const resetSetup = useGameStore((s) => s.resetSetup)
  const savedRef = useRef(false)

  const {
    gameState,
    answerHistory,
    selectedOperations,
    selectedNumbers,
    backendSessionId,
    syncedAnswerCount,
  } = useGameStore()

  useEffect(() => {
    if (savedRef.current || !gameState || answerHistory.length === 0) return
    savedRef.current = true

    const finalizeSession = async () => {
      try {
        let sessionId = backendSessionId

        // If no backend session exists (e.g. offline start), create one now
        if (!sessionId) {
          const createRes = await fetch("/api/sessoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operations: selectedOperations.map((op) => OPERATION_MAP[op]),
              numbers: selectedNumbers,
              totalQuestions: gameState.sessionTotal,
            }),
          })
          if (!createRes.ok) return
          const session = await createRes.json()
          sessionId = session.id
        }

        // Send any remaining unsynced answers
        const unsynced = answerHistory.slice(syncedAnswerCount)
        if (unsynced.length > 0) {
          await fetch(`/api/sessoes/${sessionId}/respostas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answers: unsynced.map((a) => ({
                operation: OPERATION_MAP[a.operation],
                firstOperand: a.displayFirst,
                secondOperand: a.displaySecond,
                correctAnswer: a.correctAnswer,
                userAnswer: a.userAnswer,
                isCorrect: a.isCorrect,
                attemptNumber: a.attemptNumber,
                timeSpentMs: a.timeSpentMs,
                answeredAt: a.answeredAt,
              })),
            }),
          })
        }

        // Finalize session
        const correctAnswers = answerHistory.filter((a) => a.isCorrect).length
        const wrongAnswers = answerHistory.filter((a) => !a.isCorrect).length

        await fetch(`/api/sessoes/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completed: true,
            correctAnswers,
            wrongAnswers,
          }),
        })
      } catch {
        // Silently fail — não impedir o usuário de ver o resultado
      } finally {
        clearSession()
      }
    }

    finalizeSession()
  }, [gameState, answerHistory, selectedOperations, selectedNumbers, backendSessionId, syncedAnswerCount])

  const handlePlayAgain = () => {
    resetSetup()
    router.push("/jogar")
  }

  const handleGoHome = () => {
    resetSetup()
    router.push("/")
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <SessionSummary onPlayAgain={handlePlayAgain} onGoHome={handleGoHome} />
    </div>
  )
}
