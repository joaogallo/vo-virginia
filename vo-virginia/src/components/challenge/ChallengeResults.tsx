"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useGameStore } from "@/stores/game-store"
import { useSound } from "@/hooks/useSound"
import { SESSION_MODE_LABELS, SESSION_MODE_ICONS } from "@/types/game"
import ConfettiEffect from "@/components/game/ConfettiEffect"
import LottieAnimation from "@/components/game/LottieAnimation"

interface ChallengeResultsProps {
  onNewChallenge: () => void
  onGoHome: () => void
}

export default function ChallengeResults({ onNewChallenge, onGoHome }: ChallengeResultsProps) {
  const { gameState, answerHistory, isInterrupted, interruptedReason, challengeMode } = useGameStore()
  const { playComplete } = useSound()

  const [totalTime] = useState(() =>
    gameState ? Math.round((Date.now() - gameState.sessionStartTime) / 1000) : 0
  )

  useEffect(() => {
    if (!isInterrupted) {
      playComplete()
    }
  }, [playComplete, isInterrupted])
  const minutes = Math.floor(totalTime / 60)
  const seconds = totalTime % 60

  const correctAnswers = answerHistory.filter((a) => a.isCorrect).length
  const wrongAnswers = answerHistory.filter((a) => !a.isCorrect).length
  const totalAttempts = answerHistory.length
  const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0

  const modeLabel = SESSION_MODE_LABELS[challengeMode] ?? "Desafio"
  const modeIcon = SESSION_MODE_ICONS[challengeMode] ?? "🎯"

  const isTimedMode = challengeMode === "timed_total" || challengeMode === "timed_per_question"
  const wasTimeUp = interruptedReason === "time_up_total" || interruptedReason === "time_up_question"

  const stats = [
    { label: "Acertos", value: correctAnswers, color: "text-green-600", icon: "✅" },
    { label: "Erros", value: wrongAnswers, color: "text-red-500", icon: "❌" },
    { label: "Tempo", value: `${minutes}m ${seconds}s`, color: "text-blue-600", icon: "⏱️" },
    { label: "Precisão", value: `${accuracy}%`, color: "text-purple-600", icon: "🎯" },
  ]

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      {!isInterrupted && <ConfettiEffect isActive={true} />}

      {/* Mode badge */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-100 rounded-full px-4 py-1 flex items-center gap-2"
      >
        <span>{modeIcon}</span>
        <span className="font-display text-sm font-bold text-gray-600">{modeLabel}</span>
      </motion.div>

      {/* Trophy or interrupted indicator */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
        className="w-28 h-28"
      >
        {isInterrupted ? (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {wasTimeUp ? "⏰" : "🏁"}
          </div>
        ) : (
          <LottieAnimation
            src="/animations/trophy.json"
            loop={false}
            className="w-full h-full"
          />
        )}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-display text-3xl sm:text-4xl font-bold text-gray-800 text-center"
      >
        {isInterrupted ? "Tempo Esgotado!" : "Parabéns!"}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-600 text-lg text-center"
      >
        {challengeMode === "marathon" && !isInterrupted && "Incrível maratona!"}
        {challengeMode === "review" && `Você revisou ${correctAnswers + wrongAnswers} questões!`}
        {isTimedMode && wasTimeUp && "O tempo acabou, mas você se saiu bem!"}
        {isTimedMode && !wasTimeUp && "Você completou o desafio a tempo!"}
        {challengeMode === "marathon" && isInterrupted && "Boa maratona!"}
      </motion.p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg flex flex-col items-center gap-1"
          >
            <span className="text-2xl" role="img" aria-hidden="true">{stat.icon}</span>
            <span className={`font-display text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-sm text-gray-500">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-4">
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewChallenge}
          className="flex-1 bg-gradient-to-r from-red-400 to-red-600 text-white font-display text-xl font-bold rounded-2xl py-3 shadow-lg cursor-pointer"
        >
          Novo desafio
        </motion.button>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGoHome}
          className="flex-1 bg-white text-gray-600 font-display text-xl font-bold rounded-2xl py-3 border-2 border-gray-200 shadow cursor-pointer"
        >
          Início
        </motion.button>
      </div>
    </div>
  )
}
