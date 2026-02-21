"use client"

import { motion } from "framer-motion"
import type { PersistedSession } from "@/lib/session-storage"
import { OPERATION_LABELS } from "@/types/game"

interface SessionRecoveryDialogProps {
  session: PersistedSession
  onResume: () => void
  onDiscard: () => void
}

export default function SessionRecoveryDialog({
  session,
  onResume,
  onDiscard,
}: SessionRecoveryDialogProps) {
  const answered = session.answerHistory.filter((a) => a.isCorrect).length
  const total = session.sessionTotal
  const ops = session.selectedOperations.map((op) => OPERATION_LABELS[op]).join(", ")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      role="dialog"
      aria-labelledby="recovery-title"
      aria-describedby="recovery-description"
      className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto px-4"
    >
      <h2 id="recovery-title" className="font-display text-2xl font-bold text-gray-800 text-center">
        Sessão em andamento
      </h2>
      <p id="recovery-description" className="text-gray-600 text-center">
        Você tem uma sessão interrompida. Deseja continuar de onde parou?
      </p>

      <div className="w-full bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Operações</span>
          <span className="font-bold text-gray-700">{ops}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Progresso</span>
          <span className="font-bold text-gray-700">
            {answered} de {total} questões
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Números</span>
          <span className="font-bold text-gray-700">
            {session.selectedNumbers.join(", ")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={onResume}
          className="w-full rounded-2xl py-3 px-8 font-display text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200"
        >
          Continuar
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onDiscard}
          className="w-full rounded-2xl py-3 px-8 font-display text-base font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-all duration-200"
        >
          Nova sessão
        </motion.button>
      </div>
    </motion.div>
  )
}
