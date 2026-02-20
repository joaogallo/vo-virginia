"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useGameStore } from "@/stores/game-store"
import { useKeyboardInput } from "@/hooks/useKeyboardInput"
import { useSound } from "@/hooks/useSound"
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
  } = useGameStore()

  const [showConfetti, setShowConfetti] = useState(false)
  const feedbackStartRef = useRef<number>(0)
  const { playCorrect, playIncorrect, isMuted, toggleMute } = useSound()

  const total = gameState?.sessionTotal ?? 0
  const answered = gameState?.correctCount ?? 0

  const handleConfirm = useCallback(() => {
    if (showingFeedback) {
      // Ignorar se o feedback começou há menos de 600ms (evita skip acidental)
      if (Date.now() - feedbackStartRef.current < 600) return
      advanceToNext()
      return
    }
    const result = confirmAnswer()
    if (result) {
      feedbackStartRef.current = Date.now()
      if (result.wasCorrect) {
        playCorrect()
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2500)
      } else {
        playIncorrect()
      }
    }
  }, [showingFeedback, confirmAnswer, advanceToNext, playCorrect, playIncorrect])

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

      {/* Timer, Progresso e Mudo */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <GameTimer
          isRunning={!showingFeedback && !gameState.isComplete}
          resetKey={gameState.currentQuestion.id}
        />
        <div className="flex items-center gap-3">
          <GameProgress answered={answered} total={total} />
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl cursor-pointer"
            aria-label={isMuted ? "Ativar som" : "Silenciar"}
          >
            {isMuted ? "\u{1F507}" : "\u{1F50A}"}
          </button>
        </div>
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
