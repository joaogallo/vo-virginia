"use client"

import { motion } from "framer-motion"

const operationInfo: Record<string, { icon: string; color: string }> = {
  ADDITION: { icon: "+", color: "bg-green-500" },
  SUBTRACTION: { icon: "−", color: "bg-blue-500" },
  MULTIPLICATION: { icon: "×", color: "bg-orange-500" },
  DIVISION: { icon: "÷", color: "bg-purple-500" },
}

export interface SessionItem {
  id: string
  operations: string[]
  numbers: number[]
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  startedAt: string
  endedAt: string | null
  completed: boolean
}

interface SessionListProps {
  sessions: SessionItem[]
  compact?: boolean
}

export default function SessionList({ sessions, compact = false }: SessionListProps) {
  if (sessions.length === 0) return null

  const displaySessions = compact ? sessions.slice(0, 3) : sessions

  return (
    <div>
      <h3 className="font-display text-lg font-bold text-gray-700 mb-3">
        Sessões recentes
      </h3>
      <div className="flex flex-col gap-2">
        {displaySessions.map((session, i) => {
          const totalAttempts = session.correctAnswers + session.wrongAnswers
          const accuracy = totalAttempts > 0
            ? Math.round((session.correctAnswers / totalAttempts) * 100)
            : 0

          return (
            <motion.div
              key={session.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-xl ${compact ? "p-3" : "p-4"} shadow-md`}
            >
              {/* Data e taxa */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(session.startedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className={`font-display text-sm font-bold ${accuracy >= 70 ? "text-green-600" : accuracy >= 40 ? "text-yellow-600" : "text-red-500"}`}>
                  {accuracy}%
                </span>
              </div>

              {/* Operações */}
              <div className="flex items-center gap-1.5 mb-2">
                {session.operations.map((op) => {
                  const info = operationInfo[op]
                  if (!info) return null
                  return (
                    <span
                      key={op}
                      className={`w-7 h-7 rounded-lg ${info.color} text-white font-bold text-sm flex items-center justify-center`}
                    >
                      {info.icon}
                    </span>
                  )
                })}
                <span className="text-xs text-gray-400 ml-1">
                  {session.numbers.join(", ")}
                </span>
              </div>

              {/* Questões e acertos */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{session.totalQuestions} questões</span>
                <span>✅ {session.correctAnswers}</span>
                {session.wrongAnswers > 0 && (
                  <span>❌ {session.wrongAnswers}</span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
