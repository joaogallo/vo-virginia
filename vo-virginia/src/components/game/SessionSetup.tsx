"use client"

import { motion } from "framer-motion"
import { useGameStore } from "@/stores/game-store"
import { OPERATIONS, AVAILABLE_NUMBERS } from "@/constants/operations"

interface SessionSetupProps {
  onStart: () => void
}

export default function SessionSetup({ onStart }: SessionSetupProps) {
  const {
    selectedOperations,
    selectedNumbers,
    questionLimit,
    toggleOperation,
    toggleNumber,
    setQuestionLimit,
    totalQuestions,
  } = useGameStore()

  const canStart = selectedOperations.length > 0 && selectedNumbers.length > 0
  const total = totalQuestions()
  const effectiveLimit = questionLimit !== null ? Math.min(questionLimit, total) : total

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto px-4">
      {/* Título */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display text-2xl sm:text-3xl font-bold text-gray-800 text-center"
      >
        Vó Virgínia
      </motion.h1>
      <p className="text-gray-600 text-center -mt-3">
        Escolha o que você quer praticar!
      </p>

      {/* Operações */}
      <div className="w-full">
        <h2 className="font-display text-lg font-bold text-gray-700 mb-2">
          Operações
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {OPERATIONS.map((op) => {
            const isSelected = selectedOperations.includes(op.value)
            return (
              <motion.button
                key={op.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleOperation(op.value)}
                className={`
                  rounded-2xl border-3 p-3 flex flex-col items-center gap-0.5
                  font-display text-lg font-bold transition-all duration-200
                  cursor-pointer select-none
                  ${
                    isSelected
                      ? `${op.color} text-white border-transparent shadow-lg scale-105`
                      : `bg-white ${op.borderColor} text-gray-700 border-2 shadow-sm hover:shadow-md`
                  }
                `}
              >
                <span className="text-2xl">{op.symbol}</span>
                <span className="text-xs">{op.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Números */}
      <div className="w-full">
        <h2 className="font-display text-lg font-bold text-gray-700 mb-2">
          Números
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {AVAILABLE_NUMBERS.map((num) => {
            const isSelected = selectedNumbers.includes(num)
            return (
              <motion.button
                key={num}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleNumber(num)}
                className={`
                  rounded-xl w-12 h-12 flex items-center justify-center
                  font-display text-lg font-bold transition-all duration-200
                  cursor-pointer select-none
                  ${
                    isSelected
                      ? "bg-yellow-400 text-white shadow-lg border-2 border-yellow-500"
                      : "bg-white text-gray-700 border-2 border-gray-200 shadow-sm hover:shadow-md"
                  }
                `}
              >
                {num}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Quantidade de questões */}
      {canStart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          <h2 className="font-display text-lg font-bold text-gray-700 mb-2">
            Quantidade de questões
          </h2>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={total}
              value={effectiveLimit}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                setQuestionLimit(val === total ? null : val)
              }}
              className="flex-1 accent-green-500"
            />
            <span className="font-display text-xl font-bold text-gray-700 min-w-[3ch] text-right">
              {effectiveLimit}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1 text-center">
            de {total} disponíveis
          </p>
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
              ? "bg-gradient-to-r from-green-400 to-green-600 text-white hover:shadow-xl cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        Começar!
      </motion.button>
    </div>
  )
}
