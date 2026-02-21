"use client"

import { motion } from "framer-motion"

interface GameProgressProps {
  answered: number
  total: number
}

export default function GameProgress({ answered, total }: GameProgressProps) {
  const percentage = total > 0 ? (answered / total) * 100 : 0

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-gray-600">Progresso</span>
        <span className="text-sm font-bold text-gray-800">
          {answered} de {total}
        </span>
      </div>
      <div
        className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner"
        role="progressbar"
        aria-valuenow={answered}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Progresso: ${answered} de ${total} questões`}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 via-green-400 to-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}
