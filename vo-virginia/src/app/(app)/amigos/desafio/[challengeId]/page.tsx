"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { generateQuestionsWithSeed, nextQuestion, submitAnswer } from "@/lib/game-engine"
import { useChallengePolling } from "@/hooks/useChallengePolling"
import type { Operation, GameState } from "@/types/game"

const API_TO_OP: Record<string, Operation> = {
  ADDITION: "addition",
  SUBTRACTION: "subtraction",
  MULTIPLICATION: "multiplication",
  DIVISION: "division",
}

interface ChallengeData {
  id: string
  challengerId: string
  challengedId: string
  operations: string[]
  numbers: number[]
  totalQuestions: number
  questionsSeed: string
  status: string
  challenger: { id: string; name: string }
  challenged: { id: string; name: string }
}

export default function FriendChallengePage() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const [challenge, setChallenge] = useState<ChallengeData | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [userInput, setUserInput] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [finished, setFinished] = useState(false)
  const startTimeRef = useRef<number>(0)
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { progress, start: startPolling, stop: stopPolling } = useChallengePolling(challengeId)

  // Fetch challenge details
  useEffect(() => {
    fetch(`/api/desafios-amigo/${challengeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.challenge) {
          setChallenge(data.challenge)

          if (data.challenge.status === "ACTIVE" || data.challenge.status === "PENDING") {
            const ops = data.challenge.operations.map((o: string) => API_TO_OP[o]).filter(Boolean)
            const allQuestions = generateQuestionsWithSeed(
              ops,
              data.challenge.numbers,
              data.challenge.questionsSeed,
            )
            const questions = allQuestions.slice(0, data.challenge.totalQuestions)

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
              sessionTotal: data.challenge.totalQuestions,
              mode: "practice",
              timeLimitSeconds: null,
              timeLimitPerQuestionSeconds: null,
              marathonBatchSize: 0,
            }

            const advanced = nextQuestion(state)
            setGameState(advanced)
            startTimeRef.current = Date.now()
            startPolling()
          }
        }
        setLoading(false)
      })
  }, [challengeId, startPolling])

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

    // Restart polling to see opponent's result
    startPolling()
  }, [challengeId, stopPolling, startPolling])

  const handleSubmitAnswer = useCallback(() => {
    if (!gameState?.currentQuestion || !userInput.trim()) return

    const answer = parseInt(userInput)
    if (isNaN(answer)) return

    const { newState, wasCorrect } = submitAnswer(gameState, answer)
    setFeedback(wasCorrect ? "correct" : "incorrect")
    setUserInput("")

    setTimeout(() => {
      setFeedback(null)

      if (!newState.currentQuestion) {
        const advanced = nextQuestion(newState)
        if (advanced.isComplete) {
          setGameState(advanced)
          handleFinish(advanced)
        } else {
          setGameState(advanced)
        }
      } else {
        setGameState(newState)
      }
    }, 500)
  }, [gameState, userInput, handleFinish])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmitAnswer()
  }

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
        <Link href="/amigos" className="text-blue-500 font-semibold mt-4 inline-block">
          Voltar
        </Link>
      </div>
    )
  }

  if (challenge.status === "COMPLETED" || challenge.status === "DECLINED") {
    return (
      <div className="w-full max-w-lg mx-auto px-4 text-center py-20">
        <p className="text-gray-500 text-lg">
          {challenge.status === "DECLINED" ? "Desafio recusado." : "Desafio já finalizado."}
        </p>
        <Link href="/amigos" className="text-blue-500 font-semibold mt-4 inline-block">
          Voltar
        </Link>
      </div>
    )
  }

  // Determine opponent
  const userId = progress?.challenger.id === challenge.challengerId
    ? challenge.challengerId
    : challenge.challengedId
  const isChallenger = userId === challenge.challengerId

  const opponentProgress = progress
    ? (isChallenger ? progress.challenged : progress.challenger)
    : null

  // Game finished - show results
  if (finished && gameState) {
    const opponentDone = opponentProgress?.finished

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
            href="/amigos"
            className="inline-block bg-gradient-to-r from-blue-400 to-blue-600 text-white font-display text-lg font-bold rounded-xl py-3 px-8 shadow-lg"
          >
            Voltar
          </Link>
        </motion.div>
      </div>
    )
  }

  // Active game
  const currentQ = gameState?.currentQuestion
  if (!currentQ) return null

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {/* Opponent progress bar */}
        {opponentProgress && (
          <div className="bg-white rounded-xl p-3 shadow mb-4">
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

        {/* Question card */}
        <div className={`bg-white rounded-3xl shadow-xl p-8 text-center mb-4 transition-colors ${
          feedback === "correct" ? "bg-green-50" : feedback === "incorrect" ? "bg-red-50" : ""
        }`}>
          <div className="mb-2 text-sm text-gray-500">
            {(gameState?.correctCount ?? 0) + (gameState?.wrongCount ?? 0)}/{gameState?.sessionTotal ?? 0}
          </div>

          <div className="font-display text-4xl font-bold text-gray-800 mb-6">
            {currentQ.displayFirst} {currentQ.operationSymbol} {currentQ.displaySecond} = ?
          </div>

          <div className="flex gap-2 justify-center">
            <label htmlFor="challenge-answer" className="sr-only">Resposta</label>
            <input
              id="challenge-answer"
              type="number"
              inputMode="numeric"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-32 px-4 py-3 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none"
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!userInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-xl shadow disabled:opacity-50 cursor-pointer"
            >
              OK
            </button>
          </div>

          {gameState && gameState.currentAttempt > 1 && (
            <p className="text-sm text-gray-500 mt-2">
              Tentativa {gameState.currentAttempt}/{gameState.maxRetries}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
