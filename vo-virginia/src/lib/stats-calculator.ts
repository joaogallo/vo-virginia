import type { OperationType } from "@prisma/client"

interface SessionRow {
  id: string
  operations: OperationType[]
  numbers: number[]
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  startedAt: Date
  endedAt: Date | null
  completed: boolean
}

interface AnswerRow {
  operation: OperationType
  isCorrect: boolean
  timeSpentMs: number
  answeredAt: Date
}

export interface DailyProgress {
  date: string
  total: number
  correct: number
  accuracyPercent: number
}

export interface AvgTimeByOperation {
  operation: string
  averageTimeMs: number
}

export interface BestSession {
  id: string
  startedAt: string
  operations: string[]
  accuracyPercent: number
  totalQuestions: number
  correctAnswers: number
  totalTimeMs: number
}

export interface StatsResult {
  totalSessions: number
  totalQuestions: number
  totalCorrect: number
  totalWrong: number
  accuracyPercent: number
  averageTimeMs: number
  byOperation: Record<string, { total: number; correct: number; accuracyPercent: number; averageTimeMs: number }>
  recentSessions: SessionRow[]
  dailyProgress: DailyProgress[]
  avgTimeByOperation: AvgTimeByOperation[]
  bestSessions: BestSession[]
}

const OPERATIONS = ["ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION"] as const

export function calculateStats(sessions: SessionRow[], answers: AnswerRow[]): StatsResult {
  const totalSessions = sessions.length
  const totalQuestions = answers.length
  const totalCorrect = answers.filter((a) => a.isCorrect).length
  const totalWrong = totalQuestions - totalCorrect
  const accuracyPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  const averageTimeMs = totalQuestions > 0
    ? Math.round(answers.reduce((sum, a) => sum + a.timeSpentMs, 0) / totalQuestions)
    : 0

  // By operation
  const byOperation: StatsResult["byOperation"] = {}
  for (const op of OPERATIONS) {
    const opAnswers = answers.filter((a) => a.operation === op)
    const opCorrect = opAnswers.filter((a) => a.isCorrect).length
    byOperation[op] = {
      total: opAnswers.length,
      correct: opCorrect,
      accuracyPercent: opAnswers.length > 0 ? Math.round((opCorrect / opAnswers.length) * 100) : 0,
      averageTimeMs: opAnswers.length > 0
        ? Math.round(opAnswers.reduce((sum, a) => sum + a.timeSpentMs, 0) / opAnswers.length)
        : 0,
    }
  }

  // Daily progress
  const dailyMap = new Map<string, { total: number; correct: number }>()
  for (const a of answers) {
    const date = a.answeredAt.toISOString().slice(0, 10)
    const entry = dailyMap.get(date) || { total: 0, correct: 0 }
    entry.total++
    if (a.isCorrect) entry.correct++
    dailyMap.set(date, entry)
  }
  const dailyProgress: DailyProgress[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date,
      total: d.total,
      correct: d.correct,
      accuracyPercent: Math.round((d.correct / d.total) * 100),
    }))

  // Avg time by operation (only ops with data)
  const avgTimeByOperation: AvgTimeByOperation[] = OPERATIONS
    .filter((op) => byOperation[op].total > 0)
    .map((op) => ({
      operation: op,
      averageTimeMs: byOperation[op].averageTimeMs,
    }))

  // Best sessions (top 5 by accuracy, tiebreaker: fewer total time)
  const completedSessions = sessions.filter((s) => s.completed && s.endedAt)
  const bestSessions: BestSession[] = completedSessions
    .map((s) => {
      const totalAttempts = s.correctAnswers + s.wrongAnswers
      const acc = totalAttempts > 0 ? Math.round((s.correctAnswers / totalAttempts) * 100) : 0
      const totalTimeMs = s.endedAt ? s.endedAt.getTime() - s.startedAt.getTime() : 0
      return {
        id: s.id,
        startedAt: s.startedAt.toISOString(),
        operations: s.operations as string[],
        accuracyPercent: acc,
        totalQuestions: s.totalQuestions,
        correctAnswers: s.correctAnswers,
        totalTimeMs,
      }
    })
    .sort((a, b) => b.accuracyPercent - a.accuracyPercent || a.totalTimeMs - b.totalTimeMs)
    .slice(0, 5)

  // Recent sessions (last 20)
  const recentSessions = sessions.slice(0, 20)

  return {
    totalSessions,
    totalQuestions,
    totalCorrect,
    totalWrong,
    accuracyPercent,
    averageTimeMs,
    byOperation,
    recentSessions,
    dailyProgress,
    avgTimeByOperation,
    bestSessions,
  }
}

export function periodToDate(period: string): Date | null {
  const now = new Date()
  if (period === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
  if (period === "30d") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
  return null // "all"
}
