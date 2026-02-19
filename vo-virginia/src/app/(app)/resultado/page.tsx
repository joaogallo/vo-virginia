"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/stores/game-store"
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
  } = useGameStore()

  useEffect(() => {
    if (savedRef.current || !gameState || answerHistory.length === 0) return
    savedRef.current = true

    const saveSession = async () => {
      try {
        // 1. Criar sessão no banco
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

        // 2. Submeter respostas
        await fetch(`/api/sessoes/${session.id}/respostas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answerHistory.map((a) => ({
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

        // 3. Finalizar sessão
        const correctAnswers = answerHistory.filter((a) => a.isCorrect).length
        const wrongAnswers = answerHistory.filter((a) => !a.isCorrect).length

        await fetch(`/api/sessoes/${session.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completed: true,
            correctAnswers,
            wrongAnswers,
          }),
        })
      } catch {
        // Silently fail - não impedir o usuário de ver o resultado
      }
    }

    saveSession()
  }, [gameState, answerHistory, selectedOperations, selectedNumbers])

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
