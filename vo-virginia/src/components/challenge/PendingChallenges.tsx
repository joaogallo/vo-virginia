"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface ChallengeUser {
  id: string
  name: string
}

interface Challenge {
  id: string
  challengerId: string
  challengedId: string
  status: string
  totalQuestions: number
  operations: string[]
  challenger: ChallengeUser
  challenged: ChallengeUser
  challengerCorrect: number
  challengedCorrect: number
  createdAt: string
}

const OP_SYMBOL: Record<string, string> = {
  ADDITION: "+",
  SUBTRACTION: "−",
  MULTIPLICATION: "×",
  DIVISION: "÷",
}

interface PendingChallengesProps {
  userId: string
}

export default function PendingChallenges({ userId }: PendingChallengesProps) {
  const router = useRouter()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch("/api/desafios-amigo")
      const data = await res.json()
      setChallenges(data.challenges || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const handleRespond = async (challengeId: string, action: "ACCEPT" | "DECLINE") => {
    setResponding(challengeId)
    try {
      const res = await fetch(`/api/desafios-amigo/${challengeId}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok && action === "ACCEPT") {
        router.push(`/amigos/desafio/${challengeId}`)
        return
      }
      // Refresh list after declining
      fetchChallenges()
    } catch {
      // silent
    } finally {
      setResponding(null)
    }
  }

  if (loading) {
    return <p className="text-gray-400 text-sm animate-pulse text-center">Carregando desafios...</p>
  }

  const pendingReceived = challenges.filter((c) => c.challengedId === userId && c.status === "PENDING")
  const pendingSent = challenges.filter((c) => c.challengerId === userId && c.status === "PENDING")
  const active = challenges.filter((c) => c.status === "ACTIVE")
  const completed = challenges.filter((c) => c.status === "COMPLETED").slice(0, 5)

  const hasContent = pendingReceived.length > 0 || pendingSent.length > 0 || active.length > 0 || completed.length > 0

  if (!hasContent) return null

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Pending received */}
      <AnimatePresence>
        {pendingReceived.map((c) => {
          const ops = c.operations.map((o) => OP_SYMBOL[o] || o).join(" ")
          return (
            <motion.div
              key={c.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="bg-orange-50 rounded-xl p-4 border border-orange-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-bold text-gray-800">
                    {c.challenger.name} te desafiou!
                  </p>
                  <p className="text-xs text-gray-500">
                    {ops} · {c.totalQuestions} questões
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(c.id, "ACCEPT")}
                  disabled={responding === c.id}
                  className="flex-1 px-3 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 cursor-pointer"
                >
                  {responding === c.id ? "..." : "Aceitar"}
                </button>
                <button
                  onClick={() => handleRespond(c.id, "DECLINE")}
                  disabled={responding === c.id}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-600 text-sm font-bold rounded-lg hover:bg-red-200 disabled:opacity-50 cursor-pointer"
                >
                  Recusar
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Active challenges */}
      {active.map((c) => {
        const opponent = c.challengerId === userId ? c.challenged : c.challenger
        const ops = c.operations.map((o) => OP_SYMBOL[o] || o).join(" ")
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 rounded-xl p-4 border border-green-200 flex items-center gap-3"
          >
            <span className="text-2xl">⚔️</span>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-bold text-gray-800">
                Desafio com {opponent.name}
              </p>
              <p className="text-xs text-gray-500">
                {ops} · {c.totalQuestions} questões
              </p>
            </div>
            <button
              onClick={() => router.push(`/amigos/desafio/${c.id}`)}
              className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 cursor-pointer shrink-0"
            >
              Continuar
            </button>
          </motion.div>
        )
      })}

      {/* Pending sent */}
      {pendingSent.map((c) => (
        <div
          key={c.id}
          className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center gap-3"
        >
          <span className="text-2xl">⏳</span>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold text-gray-700">
              Aguardando {c.challenged.name}...
            </p>
            <p className="text-xs text-gray-500">
              {c.operations.map((o) => OP_SYMBOL[o] || o).join(" ")} · {c.totalQuestions} questões
            </p>
          </div>
        </div>
      ))}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mt-1">
          <h4 className="font-display text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
            Resultados recentes
          </h4>
          {completed.map((c) => {
            const isChallenger = c.challengerId === userId
            const myScore = isChallenger ? c.challengerCorrect : c.challengedCorrect
            const theirScore = isChallenger ? c.challengedCorrect : c.challengerCorrect
            const opponent = isChallenger ? c.challenged : c.challenger
            const won = myScore > theirScore
            const tied = myScore === theirScore

            return (
              <div
                key={c.id}
                className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 mb-2"
              >
                <span className="text-xl">{won ? "🏆" : tied ? "🤝" : "😔"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-bold text-gray-700">
                    vs {opponent.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {myScore}/{c.totalQuestions} vs {theirScore}/{c.totalQuestions}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  won ? "bg-green-100 text-green-700" : tied ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-600"
                }`}>
                  {won ? "Vitória" : tied ? "Empate" : "Derrota"}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
