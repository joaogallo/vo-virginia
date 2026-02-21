"use client"

import { motion } from "framer-motion"
import { useGameStore } from "@/stores/game-store"
import { OPERATIONS, AVAILABLE_NUMBERS } from "@/constants/operations"

export default function OperationNumberSelector() {
  const {
    selectedOperations,
    selectedNumbers,
    toggleOperation,
    toggleNumber,
  } = useGameStore()

  return (
    <>
      {/* Operações */}
      <div className="w-full" role="group" aria-label="Selecionar operações">
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
                aria-pressed={isSelected}
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
      <div className="w-full" role="group" aria-label="Selecionar números">
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
                aria-pressed={isSelected}
                aria-label={`Número ${num}`}
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
    </>
  )
}
