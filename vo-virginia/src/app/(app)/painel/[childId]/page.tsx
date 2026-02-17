"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

interface ChildStats {
  totalSessions: number
  totalQuestions: number
  totalCorrect: number
  totalWrong: number
  accuracyPercent: number
  averageTimeMs: number
  byOperation: Record<
    string,
    { total: number; correct: number; accuracyPercent: number; averageTimeMs: number }
  >
}

const operationLabels: Record<string, { label: string; color: string; icon: string }> = {
  ADDITION: { label: "Adição", color: "bg-green-500", icon: "+" },
  SUBTRACTION: { label: "Subtração", color: "bg-blue-500", icon: "−" },
  MULTIPLICATION: { label: "Multiplicação", color: "bg-orange-500", icon: "×" },
  DIVISION: { label: "Divisão", color: "bg-purple-500", icon: "÷" },
}

export default function ChildDetailPage() {
  const params = useParams()
  const childId = params.childId as string
  const [stats, setStats] = useState<ChildStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/estatisticas/${childId}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
  }, [childId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!stats) return null

  const avgTimeSec = Math.round(stats.averageTimeMs / 1000)

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/painel" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-800">
            Estatísticas
          </h1>
        </div>

        {stats.totalQuestions === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-gray-500 text-lg">
              Esta criança ainda não respondeu nenhuma questão.
            </p>
          </div>
        ) : (
          <>
            {/* Cards resumo */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Sessões", value: stats.totalSessions, icon: "🎮" },
                { label: "Questões", value: stats.totalQuestions, icon: "❓" },
                { label: "Acertos", value: stats.totalCorrect, icon: "✅" },
                { label: "Precisão", value: `${stats.accuracyPercent}%`, icon: "🎯" },
                { label: "Erros", value: stats.totalWrong, icon: "❌" },
                { label: "Tempo médio", value: `${avgTimeSec}s`, icon: "⏱️" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-4 shadow-lg text-center"
                >
                  <span className="text-xl">{item.icon}</span>
                  <p className="font-display text-xl font-bold text-gray-800 mt-1">
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Por operação */}
            <h2 className="font-display text-xl font-bold text-gray-700 mb-3">
              Por operação
            </h2>
            <div className="flex flex-col gap-3">
              {Object.entries(stats.byOperation).map(([op, data], i) => {
                const info = operationLabels[op]
                if (!info || data.total === 0) return null
                return (
                  <motion.div
                    key={op}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-white rounded-2xl p-4 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-10 h-10 rounded-xl ${info.color} text-white font-display text-xl font-bold flex items-center justify-center`}
                        >
                          {info.icon}
                        </span>
                        <span className="font-semibold text-gray-700">{info.label}</span>
                      </div>
                      <span className="font-display text-xl font-bold text-gray-800">
                        {data.accuracyPercent}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${info.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${data.accuracyPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.correct} de {data.total} corretas &middot;{" "}
                      {Math.round(data.averageTimeMs / 1000)}s em média
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
