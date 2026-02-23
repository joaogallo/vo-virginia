"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Group {
  id: string
  name: string
  leaderboardEnabled: boolean
}

interface RankingEntry {
  id: string
  name: string
  totalSessions: number
  accuracy: number
  totalCorrect: number
  totalQuestions: number
  avgTimeMs: number
}

const PERIOD_OPTIONS = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "0", label: "Todos" },
]

const PODIUM_STYLES = [
  "bg-yellow-100 text-yellow-700 border-yellow-300",
  "bg-gray-100 text-gray-600 border-gray-300",
  "bg-orange-100 text-orange-700 border-orange-300",
]

function formatAvgTime(ms: number): string {
  if (ms === 0) return "—"
  const secs = Math.floor(ms / 1000)
  const mins = Math.floor(secs / 60)
  const remaining = secs % 60
  return mins > 0 ? `${mins}m${remaining}s` : `${remaining}s`
}

export default function RankingPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [groupName, setGroupName] = useState("")
  const [period, setPeriod] = useState("30")
  const [loading, setLoading] = useState(true)
  const [loadingRanking, setLoadingRanking] = useState(false)

  // Fetch available groups (ones I'm in or own)
  useEffect(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then((data) => {
        const allGroups = (data.groups || []).map((g: { id: string; name: string; leaderboardEnabled?: boolean }) => ({
          id: g.id,
          name: g.name,
          leaderboardEnabled: g.leaderboardEnabled ?? false,
        }))
        setGroups(allGroups)
        if (allGroups.length > 0) {
          setSelectedGroupId(allGroups[0].id)
        }
        setLoading(false)
      })
  }, [])

  const fetchRanking = useCallback((groupId: string, p: string) => {
    setLoadingRanking(true)
    fetch(`/api/grupos/${groupId}/ranking?period=${p}`)
      .then((r) => r.json())
      .then((data) => {
        setRanking(data.ranking || [])
        setGroupName(data.groupName || "")
        setLoadingRanking(false)
      })
      .catch(() => setLoadingRanking(false))
  }, [])

  // Fetch ranking when group or period changes
  useEffect(() => {
    if (!selectedGroupId) return
    fetchRanking(selectedGroupId, period)
  }, [selectedGroupId, period, fetchRanking])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="font-display text-2xl font-bold text-gray-800 mb-2">
            Ranking
          </h1>
          <p className="text-gray-500">
            Nenhum grupo disponível. Peça para seu professor ou responsável criar um grupo.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">
          Ranking
        </h1>

        {/* Group selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroupId(g.id)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap cursor-pointer transition-colors ${
                selectedGroupId === g.id
                  ? "bg-yellow-500 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Period filter */}
        <div className="flex gap-2 mb-6">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                period === opt.value
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loadingRanking ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">
              {groupName} &middot; {ranking.length} membros
            </p>

            {ranking.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                <p className="text-gray-500">Nenhuma sessão registrada neste período.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {ranking.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-2xl p-4 shadow-lg ${i < 3 ? "border-2 " + PODIUM_STYLES[i] : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        i === 0 ? "bg-yellow-500 text-white" :
                        i === 1 ? "bg-gray-400 text-white" :
                        i === 2 ? "bg-orange-400 text-white" :
                        "bg-gray-200 text-gray-600"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{entry.name}</p>
                        <p className="text-xs text-gray-500">
                          {entry.totalSessions} sessões &middot; {formatAvgTime(entry.avgTimeMs)} média
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          entry.accuracy >= 80 ? "text-green-600" :
                          entry.accuracy >= 50 ? "text-yellow-600" :
                          "text-red-500"
                        }`}>
                          {entry.accuracy}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.totalCorrect}/{entry.totalQuestions}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
