"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface UserInfo {
  id: string
  name: string
  email: string
  role: string
}

interface SessionItem {
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

const OP_LABELS: Record<string, { symbol: string; className: string }> = {
  ADDITION: { symbol: "+", className: "bg-green-100 text-green-700" },
  SUBTRACTION: { symbol: "−", className: "bg-blue-100 text-blue-700" },
  MULTIPLICATION: { symbol: "×", className: "bg-orange-100 text-orange-700" },
  DIVISION: { symbol: "÷", className: "bg-purple-100 text-purple-700" },
}

const ROLE_LABELS: Record<string, string> = {
  CHILD: "Criança",
  PARENT: "Pai/Mãe",
  TEACHER: "Professor",
  ADMIN: "Admin",
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return "—"
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const secs = Math.floor(ms / 1000)
  const mins = Math.floor(secs / 60)
  const remaining = secs % 60
  return mins > 0 ? `${mins}m${remaining}s` : `${remaining}s`
}

export default function AdminUserSessionsPage() {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/usuarios/${userId}/sessoes`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user || null)
        setSessions(data.sessions || [])
      })
      .finally(() => setLoading(false))
  }, [userId])

  const handleDelete = async (sessionId: string) => {
    setDeleting(sessionId)
    const res = await fetch(`/api/admin/sessoes/${sessionId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    }
    setDeleting(null)
    setConfirmDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 text-center py-20">
        <p className="text-gray-500 text-lg">Usuário não encontrado.</p>
        <Link href="/admin" className="text-red-500 font-semibold mt-4 inline-block">
          &larr; Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Link
          href="/admin"
          className="inline-block text-sm text-gray-400 hover:text-gray-600 mb-4"
        >
          &larr; Voltar
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-800">
            {user.name}
          </h1>
          <p className="text-gray-500 text-sm">
            {user.email} &middot; {ROLE_LABELS[user.role] || user.role}
          </p>
        </div>

        <p className="text-gray-500 text-sm mb-4">
          {sessions.length} sessões
        </p>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">Nenhuma sessão registrada.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s, i) => {
              const accuracy =
                s.totalQuestions > 0
                  ? Math.round((s.correctAnswers / s.totalQuestions) * 100)
                  : 0

              return (
                <motion.div
                  key={s.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl p-4 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {new Date(s.startedAt).toLocaleDateString("pt-BR")}{" "}
                          {new Date(s.startedAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {!s.completed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                            Incompleta
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {s.operations.map((op) => {
                          const info = OP_LABELS[op]
                          if (!info) return null
                          return (
                            <span
                              key={op}
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${info.className}`}
                            >
                              {info.symbol}
                            </span>
                          )
                        })}
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                          Tabuadas: {s.numbers.join(", ")}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {s.correctAnswers}/{s.totalQuestions} acertos
                        </span>
                        <span
                          className={`font-bold ${
                            accuracy >= 80
                              ? "text-green-600"
                              : accuracy >= 50
                                ? "text-yellow-600"
                                : "text-red-500"
                          }`}
                        >
                          {accuracy}%
                        </span>
                        <span>{formatDuration(s.startedAt, s.endedAt)}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {confirmDelete === s.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={deleting === s.id}
                            className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                          >
                            {deleting === s.id ? "..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-300 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(s.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 cursor-pointer"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      <AnimatePresence />
    </div>
  )
}
