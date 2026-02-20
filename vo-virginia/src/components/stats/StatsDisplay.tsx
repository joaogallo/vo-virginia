"use client"

import { motion } from "framer-motion"
import SessionList, { type SessionItem } from "./SessionList"
import AccuracyChart from "./AccuracyChart"
import TimeByOperationChart from "./TimeByOperationChart"
import BestSessions from "./BestSessions"
import PeriodFilter, { type Period } from "./PeriodFilter"
import ExportPdfButton from "./ExportPdfButton"

interface DailyProgress {
  date: string
  total: number
  correct: number
  accuracyPercent: number
}

interface AvgTimeByOperation {
  operation: string
  averageTimeMs: number
}

interface BestSessionItem {
  id: string
  startedAt: string
  operations: string[]
  accuracyPercent: number
  totalQuestions: number
  correctAnswers: number
  totalTimeMs: number
}

export interface Stats {
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
  recentSessions?: SessionItem[]
  dailyProgress?: DailyProgress[]
  avgTimeByOperation?: AvgTimeByOperation[]
  bestSessions?: BestSessionItem[]
}

const operationLabels: Record<string, { label: string; color: string; icon: string }> = {
  ADDITION: { label: "Adição", color: "bg-green-500", icon: "+" },
  SUBTRACTION: { label: "Subtração", color: "bg-blue-500", icon: "−" },
  MULTIPLICATION: { label: "Multiplicação", color: "bg-orange-500", icon: "×" },
  DIVISION: { label: "Divisão", color: "bg-purple-500", icon: "÷" },
}

interface StatsDisplayProps {
  stats: Stats
  compact?: boolean
  period?: Period
  onPeriodChange?: (period: Period) => void
}

export default function StatsDisplay({ stats, compact = false, period, onPeriodChange }: StatsDisplayProps) {
  const avgTimeSec = Math.round(stats.averageTimeMs / 1000)

  if (stats.totalQuestions === 0) {
    return (
      <div>
        {period && onPeriodChange && (
          <div className="flex items-center justify-between mb-4">
            <PeriodFilter value={period} onChange={onPeriodChange} />
          </div>
        )}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">
            Nenhuma questão respondida{period !== "all" ? " neste período" : " ainda"}.
          </p>
        </div>
      </div>
    )
  }

  const cards = [
    { label: "Sessões", value: stats.totalSessions, icon: "🎮" },
    { label: "Questões", value: stats.totalQuestions, icon: "❓" },
    { label: "Acertos", value: stats.totalCorrect, icon: "✅" },
    { label: "Precisão", value: `${stats.accuracyPercent}%`, icon: "🎯" },
    { label: "Erros", value: stats.totalWrong, icon: "❌" },
    { label: "Tempo médio", value: `${avgTimeSec}s`, icon: "⏱️" },
  ]

  return (
    <div>
      {/* Filtro de período + Export */}
      {period && onPeriodChange && (
        <div className="flex items-center justify-between mb-4 print:hidden">
          <PeriodFilter value={period} onChange={onPeriodChange} />
          <ExportPdfButton />
        </div>
      )}

      {/* Cards resumo */}
      <div className={`grid grid-cols-2 ${compact ? "sm:grid-cols-3" : ""} gap-3 mb-6`}>
        {cards.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.06 }}
            className={`bg-white rounded-2xl ${compact ? "p-3" : "p-4"} shadow-lg text-center`}
          >
            <span className={compact ? "text-lg" : "text-xl"}>{item.icon}</span>
            <p className={`font-display ${compact ? "text-lg" : "text-xl"} font-bold text-gray-800 mt-1`}>
              {item.value}
            </p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Gráfico de evolução de precisão */}
      {stats.dailyProgress && stats.dailyProgress.length > 0 && (
        <div className="mb-6">
          <h3 className="font-display text-lg font-bold text-gray-700 mb-3">
            Evolução de Precisão
          </h3>
          <AccuracyChart data={stats.dailyProgress} />
        </div>
      )}

      {/* Por operação */}
      <h3 className="font-display text-lg font-bold text-gray-700 mb-3">
        Por operação
      </h3>
      <div className="flex flex-col gap-3">
        {Object.entries(stats.byOperation).map(([op, data], i) => {
          const info = operationLabels[op]
          if (!info || data.total === 0) return null
          return (
            <motion.div
              key={op}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className={`bg-white rounded-2xl ${compact ? "p-3" : "p-4"} shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`${compact ? "w-8 h-8 text-base" : "w-10 h-10 text-xl"} rounded-xl ${info.color} text-white font-display font-bold flex items-center justify-center`}
                  >
                    {info.icon}
                  </span>
                  <span className="font-semibold text-gray-700">{info.label}</span>
                </div>
                <span className={`font-display ${compact ? "text-lg" : "text-xl"} font-bold text-gray-800`}>
                  {data.accuracyPercent}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${info.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${data.accuracyPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
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

      {/* Gráfico tempo médio por operação */}
      {stats.avgTimeByOperation && stats.avgTimeByOperation.length > 0 && (
        <div className="mt-6">
          <h3 className="font-display text-lg font-bold text-gray-700 mb-3">
            Tempo Médio por Operação
          </h3>
          <TimeByOperationChart data={stats.avgTimeByOperation} />
        </div>
      )}

      {/* Sessões recentes */}
      {stats.recentSessions && stats.recentSessions.length > 0 && (
        <div className="mt-6">
          <SessionList sessions={stats.recentSessions} compact={compact} />
        </div>
      )}

      {/* Melhores sessões */}
      {stats.bestSessions && stats.bestSessions.length > 0 && (
        <div className="mt-6">
          <BestSessions sessions={stats.bestSessions} />
        </div>
      )}
    </div>
  )
}
