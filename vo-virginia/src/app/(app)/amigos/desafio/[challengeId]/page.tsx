"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { generateQuestionsWithSeed, nextQuestion, submitAnswer } from "@/lib/game-engine"
import { useChallengePolling } from "@/hooks/useChallengePolling"
import { useKeyboardInput } from "@/hooks/useKeyboardInput"
import { useSound } from "@/hooks/useSound"
import OperationCard from "@/components/game/OperationCard"
import VirtualKeypad from "@/components/game/VirtualKeypad"
import Avatar from "@/components/game/Avatar"
import ConfettiEffect from "@/components/game/ConfettiEffect"
import GameProgress from "@/components/game/GameProgress"
import type { Operation, GameState, AvatarState, FeedbackType } from "@/types/game"

const API_TO_OP: Record<string, Operation> = {
  ADDITION: "addition",
  SUBTRACTION: "subtraction",
  MULTIPLICATION: "multiplication",
  DIVISION: "division",
}

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000

interface ChallengeData {
  id: string
  challengerId: string
  challengedId: string
  operations: string[]
  numbers: number[]
  totalQuestions: number
  questionsSeed: string
  status: string
  startedAt: string | null
  challenger: { id: string; name: string }
  challenged: { id: string; name: string }
}

export default function FriendChallengePage() {
  const { challengeId } = useParams<{ challengeId: string }>()

  // Core state
  const [challenge, setChallenge] = useState<ChallengeData | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)

  // Card + Keypad state
  const [inputValue, setInputValue] = useState("")
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null)
  const [showingFeedback, setShowingFeedback] = useState(false)
  const [avatarState, setAvatarState] = useState<AvatarState>("idle")
  const [showConfetti, setShowConfetti] = useState(false)

  // Simultaneous start state
  const [waitingForAcceptance, setWaitingForAcceptance] = useState(false)
  const [countdownPhase, setCountdownPhase] = useState<number | null>(null)

  // Refs
  const startTimeRef = useRef<number>(0)
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const feedbackStartRef = useRef<number>(0)
  const firstAnswerRef = useRef(false)
  const pendingStateRef = useRef<GameState | null>(null)

  const { progress, start: startPolling, stop: stopPolling } = useChallengePolling(challengeId)
  const { playCorrect, playIncorrect } = useSound()

  // Initialize game from challenge data
  const startGame = useCallback((challengeData: ChallengeData) => {
    const ops = challengeData.operations.map((o: string) => API_TO_OP[o]).filter(Boolean)
    const allQuestions = generateQuestionsWithSeed(ops, challengeData.numbers, challengeData.questionsSeed)
    const questions = allQuestions.slice(0, challengeData.totalQuestions)

    const state: GameState = {
      queue: questions,
      currentQuestion: null,
      correctCount: 0,
      wrongCount: 0,
      currentAttempt: 1,
      maxRetries: 3,
      sessionStartTime: Date.now(),
      questionStartTime: Date.now(),
      isComplete: false,
      sessionTotal: challengeData.totalQuestions,
      mode: "practice",
      timeLimitSeconds: null,
      timeLimitPerQuestionSeconds: null,
      marathonBatchSize: 0,
    }

    const advanced = nextQuestion(state)
    setGameState(advanced)
    startTimeRef.current = Date.now()
    startPolling()
  }, [startPolling])

  // Fetch challenge details
  useEffect(() => {
    fetch(`/api/desafios-amigo/${challengeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.challenge) {
          setChallenge(data.challenge)

          if (data.challenge.status === "ACTIVE") {
            const sinceStart = data.challenge.startedAt
              ? Date.now() - new Date(data.challenge.startedAt).getTime()
              : Infinity

            if (sinceStart < 10000) {
              // Recently accepted — show 3-2-1 countdown
              setCountdownPhase(3)
            } else {
              // Late join — start immediately
              startGame(data.challenge)
            }
          } else if (data.challenge.status === "PENDING") {
            // Challenger opened before acceptance — wait
            setWaitingForAcceptance(true)
          }
        }
        setLoading(false)
      })
  }, [challengeId, startGame])

  // Poll for acceptance when waiting
  useEffect(() => {
    if (!waitingForAcceptance) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/desafios-amigo/${challengeId}`)
        const data = await res.json()
        if (data.challenge?.status === "ACTIVE") {
          setWaitingForAcceptance(false)
          setChallenge(data.challenge)
          setCountdownPhase(3)
        } else if (data.challenge?.status === "DECLINED" || data.challenge?.status === "CANCELLED") {
          setWaitingForAcceptance(false)
          setChallenge(data.challenge)
        }
      } catch {
        // silent
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [waitingForAcceptance, challengeId])

  // 3-2-1 countdown
  useEffect(() => {
    if (countdownPhase === null) return
    if (countdownPhase === 0) {
      setCountdownPhase(null)
      if (challenge) startGame(challenge)
      return
    }
    const timer = setTimeout(() => {
      setCountdownPhase((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdownPhase, challenge, startGame])

  // Sync progress every 5 seconds
  useEffect(() => {
    if (!gameState || finished) return

    syncTimerRef.current = setInterval(() => {
      if (!gameState) return
      fetch(`/api/desafios-amigo/${challengeId}/progresso`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correct: gameState.correctCount,
          wrong: gameState.wrongCount,
          finished: false,
        }),
      })
    }, 5000)

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current)
    }
  }, [challengeId, gameState, finished])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  // Track first answer for inactivity
  useEffect(() => {
    if (!gameState) return
    if (gameState.correctCount > 0 || gameState.wrongCount > 0) {
      firstAnswerRef.current = true
    }
  }, [gameState?.correctCount, gameState?.wrongCount])

  // Inactivity timeout — 2 minutes for first question
  useEffect(() => {
    if (!gameState || finished || firstAnswerRef.current || countdownPhase !== null) return

    const timer = setTimeout(() => {
      if (!firstAnswerRef.current) {
        handleInactivityTimeout()
      }
    }, INACTIVITY_TIMEOUT_MS)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, finished, countdownPhase])

  const handleFinish = useCallback(async (state: GameState) => {
    setFinished(true)
    stopPolling()
    if (syncTimerRef.current) clearInterval(syncTimerRef.current)

    const timeMs = Date.now() - startTimeRef.current
    await fetch(`/api/desafios-amigo/${challengeId}/progresso`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correct: state.correctCount,
        wrong: state.wrongCount,
        finished: true,
        timeMs,
      }),
    })

    startPolling()
  }, [challengeId, stopPolling, startPolling])

  const handleInactivityTimeout = useCallback(async () => {
    setFinished(true)
    stopPolling()
    if (syncTimerRef.current) clearInterval(syncTimerRef.current)

    await fetch(`/api/desafios-amigo/${challengeId}/progresso`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correct: gameState?.correctCount ?? 0,
        wrong: gameState?.wrongCount ?? 0,
        finished: true,
        timeMs: Date.now() - startTimeRef.current,
        inactivity: true,
      }),
    })

    startPolling()
  }, [challengeId, gameState, stopPolling, startPolling])

  // Advance after feedback
  const advanceAfterFeedback = useCallback(() => {
    setShowingFeedback(false)
    setFeedbackType(null)
    setAvatarState("idle")
    setInputValue("")

    const pending = pendingStateRef.current
    if (!pending) return
    pendingStateRef.current = null

    if (!pending.currentQuestion) {
      const advanced = nextQuestion(pending)
      if (advanced.isComplete) {
        setGameState(advanced)
        handleFinish(advanced)
      } else {
        setGameState(advanced)
      }
    } else {
      setGameState(pending)
    }
  }, [handleFinish])

  // Auto-advance after feedback timeout
  useEffect(() => {
    if (!showingFeedback) return
    const timeout = setTimeout(() => {
      advanceAfterFeedback()
    }, feedbackType === "correct" ? 3000 : 2000)
    return () => clearTimeout(timeout)
  }, [showingFeedback, feedbackType, advanceAfterFeedback])

  // Input handlers
  const appendDigit = useCallback((digit: string) => {
    if (showingFeedback) return
    setInputValue((prev) => (prev.length < 5 ? prev + digit : prev))
  }, [showingFeedback])

  const deleteDigit = useCallback(() => {
    if (showingFeedback) return
    setInputValue((prev) => prev.slice(0, -1))
  }, [showingFeedback])

  const clearInput = useCallback(() => {
    if (showingFeedback) return
    setInputValue("")
  }, [showingFeedback])

  const handleConfirm = useCallback(() => {
    if (showingFeedback) {
      if (Date.now() - feedbackStartRef.current < 600) return
      advanceAfterFeedback()
      return
    }

    if (!gameState?.currentQuestion || !inputValue.trim()) return
    const answer = parseInt(inputValue)
    if (isNaN(answer)) return

    const { newState, wasCorrect } = submitAnswer(gameState, answer)
    feedbackStartRef.current = Date.now()
    setFeedbackType(wasCorrect ? "correct" : "incorrect")
    setShowingFeedback(true)
    setAvatarState(wasCorrect ? "correct" : "incorrect")
    pendingStateRef.current = newState

    if (wasCorrect) {
      playCorrect()
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2500)
    } else {
      playIncorrect()
    }
  }, [gameState, inputValue, showingFeedback, advanceAfterFeedback, playCorrect, playIncorrect])

  // Keyboard support
  useKeyboardInput({
    onDigit: appendDigit,
    onBackspace: deleteDigit,
    onClear: clearInput,
    onConfirm: handleConfirm,
    enabled: (!!gameState?.currentQuestion || showingFeedback) && !finished && countdownPhase === null,
  })

  // --- Render ---

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 text-center py-20">
        <p className="text-gray-500 text-lg">Desafio não encontrado.</p>
        <Link href="/desafios" className="text-blue-500 font-semibold mt-4 inline-block">
          Voltar
        </Link>
      </div>
    )
  }

  if (challenge.status === "COMPLETED" || challenge.status === "DECLINED" || challenge.status === "CANCELLED") {
    return (
      <div className="w-full max-w-lg mx-auto px-4 text-center py-20">
        <p className="text-gray-500 text-lg">
          {challenge.status === "DECLINED" ? "Desafio recusado."
            : challenge.status === "CANCELLED" ? "Desafio expirado."
            : "Desafio já finalizado."}
        </p>
        <Link href="/desafios" className="text-blue-500 font-semibold mt-4 inline-block">
          Voltar
        </Link>
      </div>
    )
  }

  // Waiting for opponent to accept
  if (waitingForAcceptance) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 text-center py-20">
        <div className="animate-pulse text-5xl mb-4">⏳</div>
        <h2 className="font-display text-xl font-bold text-gray-700 mb-2">
          Aguardando oponente aceitar...
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          O desafio foi enviado. Aguarde a resposta.
        </p>
        <Link href="/desafios" className="text-blue-500 font-semibold">
          Voltar
        </Link>
      </div>
    )
  }

  // 3-2-1 countdown
  if (countdownPhase !== null && countdownPhase > 0) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 text-center py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdownPhase}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="font-display text-8xl font-bold text-orange-500"
          >
            {countdownPhase}
          </motion.div>
        </AnimatePresence>
        <p className="font-display text-lg text-gray-600 mt-4">Preparar...</p>
      </div>
    )
  }

  // Determine opponent from polling data
  const userId = progress?.challenger.id === challenge.challengerId
    ? challenge.challengerId
    : challenge.challengedId
  const isChallenger = userId === challenge.challengerId

  const opponentProgress = progress
    ? (isChallenger ? progress.challenged : progress.challenger)
    : null

  // Game finished — show results
  if (finished && gameState) {
    const opponentDone = opponentProgress?.finished
    const opponentInactive = opponentProgress?.inactivity

    return (
      <div className="w-full max-w-lg mx-auto px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="text-5xl mb-4">
            {opponentDone
              ? (gameState.correctCount > (opponentProgress?.correct ?? 0) ? "🏆" : gameState.correctCount === (opponentProgress?.correct ?? 0) ? "🤝" : "💪")
              : "⏳"}
          </div>

          <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">
            {opponentDone ? "Resultado" : "Esperando oponente..."}
          </h2>

          {opponentDone && opponentInactive && (
            <p className="text-sm text-orange-500 font-semibold mb-3">
              Oponente encerrado por inatividade
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Você</p>
              <p className="font-display text-3xl font-bold text-blue-600">
                {gameState.correctCount}/{gameState.sessionTotal}
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">{opponentProgress?.name || "Oponente"}</p>
              <p className="font-display text-3xl font-bold text-orange-600">
                {opponentDone
                  ? `${opponentProgress?.correct ?? "?"}/${challenge.totalQuestions}`
                  : "..."}
              </p>
            </div>
          </div>

          <Link
            href="/desafios"
            className="inline-block bg-gradient-to-r from-blue-400 to-blue-600 text-white font-display text-lg font-bold rounded-xl py-3 px-8 shadow-lg"
          >
            Voltar
          </Link>
        </motion.div>
      </div>
    )
  }

  // Active game — Card + Keypad UI
  const currentQ = gameState?.currentQuestion
  if (!currentQ || !gameState) return null

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto px-4 pb-8">
      <ConfettiEffect isActive={showConfetti} />

      {/* My progress */}
      <div className="w-full max-w-lg">
        <GameProgress
          answered={gameState.correctCount + gameState.wrongCount}
          total={gameState.sessionTotal}
        />
      </div>

      {/* Opponent progress bar */}
      {opponentProgress && (
        <div className="bg-white rounded-xl p-3 shadow w-full max-w-lg">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-semibold text-gray-600">
              {opponentProgress.name}
            </span>
            <span className="text-gray-500">
              {opponentProgress.correct + opponentProgress.wrong}/{challenge.totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-400 h-2 rounded-full transition-all"
              style={{
                width: `${Math.round(((opponentProgress.correct + opponentProgress.wrong) / challenge.totalQuestions) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Avatar */}
      <Avatar state={avatarState} />

      {/* Card + Keypad */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
        <div className="flex flex-col items-center gap-4">
          <OperationCard
            question={currentQ}
            inputValue={inputValue}
            feedbackType={feedbackType}
            showingFeedback={showingFeedback}
            currentAttempt={gameState.currentAttempt}
            maxRetries={gameState.maxRetries}
          />

          {showingFeedback && (
            <button
              onClick={advanceAfterFeedback}
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
