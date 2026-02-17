"use client"

import { motion } from "framer-motion"
import { useGameStore } from "@/stores/game-store"
import ConfettiEffect from "./ConfettiEffect"

interface SessionSummaryProps {
  onPlayAgain: () => void
  onGoHome: () => void
}

export default function SessionSummary({ onPlayAgain, onGoHome }: SessionSummaryProps) {
  const { gameState, answerHistory } = useGameStore()

  const totalTime = gameState
    ? Math.round((Date.now() - gameState.sessionStartTime) / 1000)
    : 0
  const minutes = Math.floor(totalTime / 60)
  const seconds = totalTime % 60

  const correctAnswers = answerHistory.filter((a) => a.isCorrect).length
  const wrongAnswers = answerHistory.filter((a) => !a.isCorrect).length
  const totalAttempts = answerHistory.length
  const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0

  const stats = [
    { label: "Acertos", value: correctAnswers, color: "text-green-600", icon: "✅" },
    { label: "Erros", value: wrongAnswers, color: "text-red-500", icon: "❌" },
    { label: "Tempo", value: `${minutes}m ${seconds}s`, color: "text-blue-600", icon: "⏱️" },
    { label: "Precisão", value: `${accuracy}%`, color: "text-purple-600", icon: "🎯" },
  ]

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <ConfettiEffect isActive={true} />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
        className="text-7xl"
      >
        🏆
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-display text-3xl sm:text-4xl font-bold text-gray-800 text-center"
      >
        Parabéns!
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-600 text-lg text-center"
      >
        Você completou a sessão!
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
            <span className="text-2xl">{stat.icon}</span>
            <span className={`font-display text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-sm text-gray-500">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-4">
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayAgain}
          className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white font-display text-xl font-bold rounded-2xl py-3 shadow-lg cursor-pointer"
        >
          Jogar de novo
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
