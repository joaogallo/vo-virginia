"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/stores/game-store"
import { clearSession } from "@/lib/session-storage"
import ChallengeResults from "@/components/challenge/ChallengeResults"
import MedalNotification from "@/components/medals/MedalNotification"
import type { Operation } from "@/types/game"
import type { NewMedal } from "@/lib/medal-checker"

const OPERATION_MAP: Record<Operation, string> = {
  addition: "ADDITION",
  subtraction: "SUBTRACTION",
  multiplication: "MULTIPLICATION",
  division: "DIVISION",
}

export default function DesafioResultadoPage() {
  const router = useRouter()
  const resetChallengeSetup = useGameStore((s) => s.resetChallengeSetup)
  const savedRef = useRef(false)
  const [newMedals, setNewMedals] = useState<NewMedal[]>([])

  const {
    gameState,
    answerHistory,
    selectedOperations,
    selectedNumbers,
    backendSessionId,
    syncedAnswerCount,
    isInterrupted,
    interruptedReason,
    challengeMode,
  } = useGameStore()

  useEffect(() => {
    if (savedRef.current || !gameState || answerHistory.length === 0) return
    savedRef.current = true

    const finalizeSession = async () => {
      try {
        let sessionId = backendSessionId

        // If no backend session exists, create one now
        if (!sessionId) {
          const createRes = await fetch("/api/sessoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operations: selectedOperations.map((op) => OPERATION_MAP[op]),
              numbers: selectedNumbers,
              totalQuestions: gameState.sessionTotal,
              mode: challengeMode === "timed_total" ? "TIMED_TOTAL"
                : challengeMode === "timed_per_question" ? "TIMED_PER_QUESTION"
                : challengeMode === "marathon" ? "MARATHON"
                : challengeMode === "review" ? "REVIEW"
                : "PRACTICE",
              timeLimitSeconds: gameState.timeLimitSeconds ?? undefined,
              timeLimitPerQuestionSeconds: gameState.timeLimitPerQuestionSeconds ?? undefined,
            }),
          })
          if (!createRes.ok) return
          const session = await createRes.json()
          sessionId = session.id
        }

        // Send unsynced answers
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

        const patchBody: Record<string, unknown> = {
          completed: !isInterrupted,
          correctAnswers,
          wrongAnswers,
        }

        if (isInterrupted && interruptedReason) {
          patchBody.interruptedReason = interruptedReason
        }

        // Marathon: update totalQuestions with actual count
        if (challengeMode === "marathon") {
          patchBody.totalQuestions = gameState.sessionTotal
        }

        await fetch(`/api/sessoes/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody),
        })

        // Check for new medals
        const medalRes = await fetch("/api/medalhas/verificar", {
          method: "POST",
        })
        if (medalRes.ok) {
          const { newMedals: medals } = await medalRes.json()
          if (medals && medals.length > 0) {
            setNewMedals(medals)
          }
        }
      } catch {
        // Silently fail
      } finally {
        clearSession()
      }
    }

    finalizeSession()
  }, [gameState, answerHistory, selectedOperations, selectedNumbers, backendSessionId, syncedAnswerCount, isInterrupted, interruptedReason, challengeMode])

  const handleNewChallenge = () => {
    resetChallengeSetup()
    router.push("/desafios")
  }

  const handleGoHome = () => {
    resetChallengeSetup()
    router.push("/")
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <ChallengeResults onNewChallenge={handleNewChallenge} onGoHome={handleGoHome} />
      <MedalNotification medals={newMedals} />
    </div>
  )
}
