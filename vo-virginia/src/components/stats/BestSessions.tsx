"use client"

import { motion } from "framer-motion"

interface BestSession {
  id: string
  startedAt: string
  operations: string[]
  accuracyPercent: number
  totalQuestions: number
  correctAnswers: number
  totalTimeMs: number
}

interface BestSessionsProps {
  sessions: BestSession[]
}

const operationInfo: Record<string, { icon: string; color: string }> = {
  ADDITION: { icon: "+", color: "bg-green-500" },
  SUBTRACTION: { icon: "\u2212", color: "bg-blue-500" },
  MULTIPLICATION: { icon: "\u00d7", color: "bg-orange-500" },
  DIVISION: { icon: "\u00f7", color: "bg-purple-500" },
}

const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}"]

function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return min > 0 ? `${min}min ${sec}s` : `${sec}s`
}

export default function BestSessions({ sessions }: BestSessionsProps) {
  if (sessions.length === 0) return null

  return (
    <div>
      <h3 className="font-display text-lg font-bold text-gray-700 mb-3">
        Melhores Sessões
      </h3>
      <div className="flex flex-col gap-2">
        {sessions.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3"
          >
            <span className="text-2xl w-8 text-center shrink-0">
              {i < 3 ? medals[i] : `${i + 1}.`}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {s.operations.map((op) => {
                  const info = operationInfo[op]
                  if (!info) return null
                  return (
                    <span
                      key={op}
                      className={`w-6 h-6 rounded-md ${info.color} text-white font-bold text-xs flex items-center justify-center`}
                    >
                      {info.icon}
                    </span>
                  )
                })}
                <span className="text-xs text-gray-400 ml-1">
                  {new Date(s.startedAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{s.correctAnswers}/{s.totalQuestions} questões</span>
                <span>{formatDuration(s.totalTimeMs)}</span>
              </div>
            </div>

            <span
              className={`font-display text-xl font-bold ${
                s.accuracyPercent >= 70
                  ? "text-green-600"
                  : s.accuracyPercent >= 40
                    ? "text-yellow-600"
                    : "text-red-500"
              }`}
            >
              {s.accuracyPercent}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
