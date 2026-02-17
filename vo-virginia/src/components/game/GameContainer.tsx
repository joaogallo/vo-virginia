"use client"

import { useCallback, useEffect, useState } from "react"
import { useGameStore } from "@/stores/game-store"
import { useKeyboardInput } from "@/hooks/useKeyboardInput"
import OperationCard from "./OperationCard"
import VirtualKeypad from "./VirtualKeypad"
import GameTimer from "./GameTimer"
import GameProgress from "./GameProgress"
import Avatar from "./Avatar"
import ConfettiEffect from "./ConfettiEffect"

interface GameContainerProps {
  onSessionComplete: () => void
}

export default function GameContainer({ onSessionComplete }: GameContainerProps) {
  const {
    gameState,
    inputValue,
    showingFeedback,
    feedbackType,
    avatarState,
    appendDigit,
    deleteDigit,
    clearInput,
    confirmAnswer,
    advanceToNext,
    questionsAnswered,
    totalQuestions,
  } = useGameStore()

  const [showConfetti, setShowConfetti] = useState(false)

  const total = totalQuestions()
  const answered = questionsAnswered()

  const handleConfirm = useCallback(() => {
    if (showingFeedback) {
      // Avançar após feedback
      advanceToNext()
      return
    }
    const result = confirmAnswer()
    if (result?.wasCorrect) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2500)
    }
  }, [showingFeedback, confirmAnswer, advanceToNext])

  // Keyboard input
  useKeyboardInput({
    onDigit: appendDigit,
    onBackspace: deleteDigit,
    onClear: clearInput,
    onConfirm: handleConfirm,
    enabled: !!gameState?.currentQuestion,
  })

  // Avançar automaticamente após feedback (timeout)
  useEffect(() => {
    if (!showingFeedback) return

    const timeout = setTimeout(() => {
      advanceToNext()
    }, feedbackType === "correct" ? 2000 : 1500)

    return () => clearTimeout(timeout)
  }, [showingFeedback, feedbackType, advanceToNext])

  // Sessão completa
  useEffect(() => {
    if (gameState?.isComplete) {
      onSessionComplete()
    }
  }, [gameState?.isComplete, onSessionComplete])

  if (!gameState || !gameState.currentQuestion) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto px-4 pb-8">
      <ConfettiEffect isActive={showConfetti} />

      {/* Timer e Progresso */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <GameTimer
          isRunning={!showingFeedback && !gameState.isComplete}
          resetKey={gameState.currentQuestion.id}
        />
        <GameProgress answered={answered} total={total} />
      </div>

      {/* Avatar */}
      <Avatar state={avatarState} />

      {/* Card + Keypad: coluna no mobile, lado a lado no desktop */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
        <div className="flex flex-col items-center gap-4">
          <OperationCard
            question={gameState.currentQuestion}
            inputValue={inputValue}
            feedbackType={feedbackType}
            showingFeedback={showingFeedback}
            currentAttempt={gameState.currentAttempt}
            maxRetries={gameState.maxRetries}
          />

          {showingFeedback && (
            <button
              onClick={() => advanceToNext()}
              className="text-gray-400 text-sm animate-pulse cursor-pointer"
            >
              Toque para continuar
            </button>
          )}
        </div>

        <div className="lg:pt-4">
          <VirtualKeypad
            onDigit={appendDigit}
            onBackspace={deleteDigit}
            onClear={clearInput}
            onConfirm={handleConfirm}
            disabled={showingFeedback}
          />
        </div>
      </div>
    </div>
  )
}
