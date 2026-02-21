"use client"

import { motion } from "framer-motion"
import type { SessionMode } from "@/types/game"

const CHALLENGE_MODES: {
  value: SessionMode
  label: string
  icon: string
  description: string
  color: string
  borderColor: string
}[] = [
  {
    value: "timed_total",
    label: "Contra o Tempo (Total)",
    icon: "⏱️",
    description: "Resolva X questões em Y segundos",
    color: "bg-red-500",
    borderColor: "border-red-500",
  },
  {
    value: "timed_per_question",
    label: "Contra o Tempo (Por Questão)",
    icon: "⏰",
    description: "Cada questão tem um tempo máximo",
    color: "bg-orange-500",
    borderColor: "border-orange-500",
  },
  {
    value: "marathon",
    label: "Maratona",
    icon: "🏃",
    description: "Questões infinitas, até onde você vai?",
    color: "bg-blue-500",
    borderColor: "border-blue-500",
  },
  {
    value: "review",
    label: "Revisão",
    icon: "🔄",
    description: "Pratique as questões que mais errou",
    color: "bg-purple-500",
    borderColor: "border-purple-500",
  },
]

interface ChallengeModeSelectorProps {
  selectedMode: SessionMode | null
  onSelectMode: (mode: SessionMode) => void
}

export default function ChallengeModeSelector({ selectedMode, onSelectMode }: ChallengeModeSelectorProps) {
  return (
    <div className="w-full" role="group" aria-label="Selecionar modo de desafio">
      <h2 className="font-display text-lg font-bold text-gray-700 mb-2">
        Modo de Desafio
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHALLENGE_MODES.map((mode) => {
          const isSelected = selectedMode === mode.value
          return (
            <motion.button
              key={mode.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectMode(mode.value)}
              aria-pressed={isSelected}
              className={`
                rounded-2xl p-4 flex items-start gap-3 text-left
                font-display transition-all duration-200
                cursor-pointer select-none
                ${
                  isSelected
                    ? `${mode.color} text-white shadow-lg scale-[1.02]`
                    : `bg-white ${mode.borderColor} text-gray-700 border-2 shadow-sm hover:shadow-md`
                }
              `}
            >
              <span className="text-2xl mt-0.5">{mode.icon}</span>
              <div className="flex flex-col">
                <span className="font-bold text-sm">{mode.label}</span>
                <span className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-gray-500"}`}>
                  {mode.description}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
