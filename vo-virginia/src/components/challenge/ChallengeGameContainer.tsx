"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useGameStore } from "@/stores/game-store"
import { useKeyboardInput } from "@/hooks/useKeyboardInput"
import { useSound } from "@/hooks/useSound"
import { useSessionPersistence } from "@/hooks/useSessionPersistence"
import OperationCard from "@/components/game/OperationCard"
import VirtualKeypad from "@/components/game/VirtualKeypad"
import GameTimer from "@/components/game/GameTimer"
import GameProgress from "@/components/game/GameProgress"
import Avatar from "@/components/game/Avatar"
import ConfettiEffect from "@/components/game/ConfettiEffect"
import CountdownTimer from "./CountdownTimer"

interface ChallengeGameContainerProps {
  onSessionComplete: () => void
}

export default function ChallengeGameContainer({ onSessionComplete }: ChallengeGameContainerProps) {
  const {
    gameState,
    inputValue,
    showingFeedback,
    feedbackType,
    avatarState,
    answerHistory,
    isInterrupted,
    appendDigit,
    deleteDigit,
    clearInput,
    confirmAnswer,
    advanceToNext,
    interruptSession,
    endMarathon,
  } = useGameStore()

  const [showConfetti, setShowConfetti] = useState(false)
  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const feedbackStartRef = useRef<number>(0)
  const { playCorrect, playIncorrect, isMuted, toggleMute } = useSound()
  const { isSyncing } = useSessionPersistence()

  const mode = gameState?.mode ?? "practice"
  const totalTimeLimit = gameState?.timeLimitSeconds ?? 0
  const perQuestionTimeLimit = gameState?.timeLimitPerQuestionSeconds ?? 0

  // Count questions answered for marathon display
  const marathonAnswered = answerHistory.filter((a) => a.isCorrect).length

  const handleConfirm = useCallback(() => {
    if (showingFeedback) {
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

  useKeyboardInput({
    onDigit: appendDigit,
    onBackspace: deleteDigit,
    onClear: clearInput,
    onConfirm: handleConfirm,
    enabled: !!gameState?.currentQuestion || showingFeedback,
  })

  // Auto-advance after feedback
  useEffect(() => {
    if (!showingFeedback) return
    const timeout = setTimeout(() => {
      advanceToNext()
    }, feedbackType === "correct" ? 3000 : 2000)
    return () => clearTimeout(timeout)
  }, [showingFeedback, feedbackType, advanceToNext])

  // Session complete
  useEffect(() => {
    if (gameState?.isComplete || isInterrupted) {
      onSessionComplete()
    }
  }, [gameState?.isComplete, isInterrupted, onSessionComplete])

  // Timed total: time up
  const handleTimedTotalTimeUp = useCallback(() => {
    interruptSession("time_up_total")
  }, [interruptSession])

  // Timed per question: time up
  const handlePerQuestionTimeUp = useCallback(() => {
    interruptSession("time_up_question")
  }, [interruptSession])

  // Marathon stop
  const handleMarathonStop = useCallback(() => {
    setShowStopConfirm(false)
    endMarathon()
  }, [endMarathon])

  if (!gameState || (!gameState.currentQuestion && !showingFeedback)) {
    return null
  }

  const total = gameState.sessionTotal
  const answered = gameState.correctCount

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto px-4 pb-8">
      <ConfettiEffect isActive={showConfetti} />

      {/* Timer, Progresso e Mudo */}
      <div className="w-full max-w-lg flex items-center justify-between">
        {/* Timer area */}
        {mode === "timed_total" && (
          <CountdownTimer
            totalSeconds={totalTimeLimit}
            isRunning={!showingFeedback && !gameState.isComplete}
            resetKey="total"
            onTimeUp={handleTimedTotalTimeUp}
            label="Tempo total restante"
          />
        )}
        {mode === "timed_per_question" && (
          <CountdownTimer
            totalSeconds={perQuestionTimeLimit}
            isRunning={!showingFeedback && !gameState.isComplete}
            resetKey={gameState.currentQuestion?.id ?? ""}
            onTimeUp={handlePerQuestionTimeUp}
            label="Tempo restante para esta questão"
          />
        )}
        {(mode === "marathon" || mode === "review") && (
          <GameTimer
            isRunning={!showingFeedback && !gameState.isComplete}
            resetKey="session"
          />
        )}

        <div className="flex items-center gap-3">
          {isSyncing && (
            <span className="text-xs text-gray-400 animate-pulse">Salvando...</span>
          )}

          {/* Progress display */}
          {mode === "marathon" ? (
            <div className="text-center">
              <span className="font-display text-lg font-bold text-gray-800">
                {marathonAnswered}
              </span>
              <span className="text-xs text-gray-500 ml-1">respondidas</span>
            </div>
          ) : (
            <GameProgress answered={answered} total={total} />
          )}

          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl cursor-pointer"
            aria-label={isMuted ? "Ativar som" : "Silenciar"}
          >
            {isMuted ? "\u{1F507}" : "\u{1F50A}"}
          </button>
        </div>
      </div>

      {/* Marathon stop button */}
      {mode === "marathon" && !showStopConfirm && (
        <button
          onClick={() => setShowStopConfirm(true)}
          className="bg-red-100 text-red-600 font-display font-bold text-sm rounded-xl px-4 py-2 hover:bg-red-200 transition-colors cursor-pointer"
        >
          Parar Maratona
        </button>
      )}

      {/* Marathon stop confirmation */}
      {showStopConfirm && (
        <div className="flex items-center gap-3 bg-red-50 rounded-2xl p-3">
          <span className="text-sm text-red-700 font-semibold">Tem certeza?</span>
          <button
            onClick={handleMarathonStop}
            className="bg-red-500 text-white font-bold text-sm rounded-xl px-3 py-1 cursor-pointer"
          >
            Sim, parar
          </button>
          <button
            onClick={() => setShowStopConfirm(false)}
            className="bg-white text-gray-600 font-bold text-sm rounded-xl px-3 py-1 border border-gray-200 cursor-pointer"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Avatar */}
      <Avatar state={avatarState} />

      {/* Card + Keypad */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
        <div className="flex flex-col items-center gap-4">
          <OperationCard
            question={gameState.currentQuestion!}
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
