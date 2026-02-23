"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useGameStore } from "@/stores/game-store"
import type { SessionMode } from "@/types/game"
import OperationNumberSelector from "@/components/game/OperationNumberSelector"
import ChallengeModeSelector from "./ChallengeModeSelector"

const TIME_TOTAL_PRESETS = [30, 60, 90, 120, 180, 300]
const TIME_PER_QUESTION_PRESETS = [5, 10, 15, 20, 30]

interface ChallengeSetupProps {
  onStart: () => void
  reviewQuestionCount: number
  loadingReview: boolean
}

export default function ChallengeSetup({ onStart, reviewQuestionCount, loadingReview }: ChallengeSetupProps) {
  const {
    selectedOperations,
    selectedNumbers,
    questionLimit,
    challengeMode,
    timeLimitSeconds,
    timeLimitPerQuestionSeconds,
    setChallengeMode,
    setTimeLimits,
    setQuestionLimit,
    totalQuestions,
  } = useGameStore()

  const [selectedModeLocal, setSelectedModeLocal] = useState<SessionMode | null>(
    challengeMode !== "practice" ? challengeMode : null
  )

  const handleSelectMode = (mode: SessionMode) => {
    setSelectedModeLocal(mode)
    setChallengeMode(mode)
    // Reset time limits when mode changes
    if (mode === "timed_total") {
      setTimeLimits(60, null)
    } else if (mode === "timed_per_question") {
      setTimeLimits(null, 10)
    } else {
      setTimeLimits(null, null)
    }
  }

  const hasOperationsAndNumbers = selectedOperations.length > 0 && selectedNumbers.length > 0
  const total = totalQuestions()
  const effectiveLimit = questionLimit !== null ? Math.min(questionLimit, total) : total

  const needsOpsAndNums = selectedModeLocal !== "review"
  const canStart = (() => {
    if (!selectedModeLocal) return false
    if (selectedModeLocal === "review") return reviewQuestionCount > 0
    if (!hasOperationsAndNumbers) return false
    if (selectedModeLocal === "timed_total") return !!timeLimitSeconds
    if (selectedModeLocal === "timed_per_question") return !!timeLimitPerQuestionSeconds
    return true
  })()

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <ChallengeModeSelector
        selectedMode={selectedModeLocal}
        onSelectMode={handleSelectMode}
      />

      {/* Mode-specific config */}
      {selectedModeLocal && needsOpsAndNums && (
        <OperationNumberSelector />
      )}

      {/* Timed total config */}
      {selectedModeLocal === "timed_total" && hasOperationsAndNumbers && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
          <h2 className="font-display text-lg font-bold text-gray-700 mb-2">
            Quantidade de questões
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="range"
              min={1}
              max={total}
              value={effectiveLimit}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                setQuestionLimit(val === total ? null : val)
              }}
              aria-label="Quantidade de questões"
              aria-valuetext={`${effectiveLimit} de ${total} questões`}
              className="flex-1 accent-red-500"
            />
            <span className="font-display text-xl font-bold text-gray-700 min-w-[3ch] text-right">
              {effectiveLimit}
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-gray-700 mb-2">
            Tempo total (segundos)
          </h2>
          <div className="flex flex-wrap gap-2">
            {TIME_TOTAL_PRESETS.map((t) => (
              <button
                key={t}
                onClick={() => setTimeLimits(t, null)}
                className={`
                  rounded-xl px-4 py-2 font-display font-bold text-sm transition-all cursor-pointer
                  ${timeLimitSeconds === t
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:shadow-md"
                  }
                `}
              >
                {t >= 60 ? `${Math.floor(t / 60)}m${t % 60 > 0 ? ` ${t % 60}s` : ""}` : `${t}s`}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Timed per question config */}
      {selectedModeLocal === "timed_per_question" && hasOperationsAndNumbers && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
          <h2 className="font-display text-lg font-bold text-gray-700 mb-2">
            Quantidade de questões
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="range"
              min={1}
              max={total}
              value={effectiveLimit}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                setQuestionLimit(val === total ? null : val)
              }}
              aria-label="Quantidade de questões"
              aria-valuetext={`${effectiveLimit} de ${total} questões`}
              className="flex-1 accent-orange-500"
            />
            <span className="font-display text-xl font-bold text-gray-700 min-w-[3ch] text-right">
              {effectiveLimit}
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-gray-700 mb-2">
            Tempo por questão (segundos)
          </h2>
          <div className="flex flex-wrap gap-2">
            {TIME_PER_QUESTION_PRESETS.map((t) => (
              <button
                key={t}
                onClick={() => setTimeLimits(null, t)}
                className={`
                  rounded-xl px-4 py-2 font-display font-bold text-sm transition-all cursor-pointer
                  ${timeLimitPerQuestionSeconds === t
                    ? "bg-orange-500 text-white shadow-lg"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:shadow-md"
                  }
                `}
              >
                {t}s
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Review mode info */}
      {selectedModeLocal === "review" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
          {loadingReview ? (
            <p className="text-gray-500 text-center animate-pulse">Carregando questões...</p>
          ) : reviewQuestionCount > 0 ? (
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <p className="font-display font-bold text-purple-700 text-lg">
                {reviewQuestionCount} questões para revisar
              </p>
              <p className="text-purple-500 text-sm mt-1">
                Baseado nas questões que você mais errou
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="font-display font-bold text-gray-600 text-lg">
                Nenhuma questão para revisar
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Jogue mais sessões para ter questões para revisar!
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Botão Começar */}
      <motion.button
        whileTap={canStart ? { scale: 0.95 } : {}}
        whileHover={canStart ? { scale: 1.05 } : {}}
        onClick={canStart ? onStart : undefined}
        disabled={!canStart}
        className={`
          w-full max-w-xs rounded-2xl py-3 px-8
          font-display text-xl font-bold
          transition-all duration-200 shadow-lg
          ${
            canStart
              ? "bg-gradient-to-r from-red-400 to-red-600 text-white hover:shadow-xl cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        Começar Desafio!
      </motion.button>
    </div>
  )
}
