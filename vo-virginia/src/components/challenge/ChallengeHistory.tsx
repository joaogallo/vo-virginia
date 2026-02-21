"use client"

import { useEffect, useState } from "react"
import { SESSION_MODE_LABELS, SESSION_MODE_ICONS } from "@/types/game"

interface ChallengeSession {
  id: string
  mode: string
  startedAt: string
  endedAt: string | null
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  completed: boolean
  interruptedReason: string | null
  timeLimitSeconds: number | null
  timeLimitPerQuestionSeconds: number | null
}

const MODE_MAP: Record<string, string> = {
  TIMED_TOTAL: "timed_total",
  TIMED_PER_QUESTION: "timed_per_question",
  MARATHON: "marathon",
  REVIEW: "review",
}

export default function ChallengeHistory() {
  const [sessions, setSessions] = useState<ChallengeSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/desafios/historico?limit=10")
      .then((res) => res.json())
      .then((data) => {
        setSessions(data.sessions ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="w-full">
        <h2 className="font-display text-lg font-bold text-gray-700 mb-3">Histórico</h2>
        <p className="text-gray-400 text-sm animate-pulse">Carregando...</p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="w-full">
        <h2 className="font-display text-lg font-bold text-gray-700 mb-3">Histórico</h2>
        <p className="text-gray-400 text-sm text-center">
          Nenhum desafio completado ainda. Comece seu primeiro!
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="font-display text-lg font-bold text-gray-700 mb-3">Histórico</h2>
      <div className="flex flex-col gap-2">
        {sessions.map((session) => {
          const modeKey = MODE_MAP[session.mode] ?? session.mode
          const label = SESSION_MODE_LABELS[modeKey as keyof typeof SESSION_MODE_LABELS] ?? session.mode
          const icon = SESSION_MODE_ICONS[modeKey as keyof typeof SESSION_MODE_ICONS] ?? "🎯"
          const total = session.correctAnswers + session.wrongAnswers
          const accuracy = total > 0 ? Math.round((session.correctAnswers / total) * 100) : 0
          const date = new Date(session.startedAt)
          const elapsed = session.endedAt
            ? Math.round((new Date(session.endedAt).getTime() - date.getTime()) / 1000)
            : 0
          const mins = Math.floor(elapsed / 60)
          const secs = elapsed % 60

          return (
            <div
              key={session.id}
              className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3"
            >
              <span className="text-2xl">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-gray-700 truncate">
                    {label}
                  </span>
                  {session.interruptedReason && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                      Interrompido
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span>{date.toLocaleDateString("pt-BR")}</span>
                  <span>{session.correctAnswers}/{total} acertos</span>
                  <span>{accuracy}%</span>
                  {elapsed > 0 && <span>{mins}m {secs}s</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
