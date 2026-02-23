"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import StatsDisplay, { type Stats } from "@/components/stats/StatsDisplay"
import type { Period } from "@/components/stats/PeriodFilter"

interface ChildSocial {
  friendshipEnabled: boolean
  challengeEnabled: boolean
}

interface ChildFriend {
  id: string
  name: string
  friendshipId: string
  status: string
  blockedBy: string | null
}

export default function ChildDetailPage() {
  const params = useParams()
  const childId = params.childId as string
  const [stats, setStats] = useState<Stats | null>(null)
  const [childName, setChildName] = useState("")
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>("all")
  const [social, setSocial] = useState<ChildSocial>({ friendshipEnabled: false, challengeEnabled: false })
  const [friends, setFriends] = useState<ChildFriend[]>([])
  const [blockingId, setBlockingId] = useState<string | null>(null)

  const fetchStats = useCallback((p: Period) => {
    return fetch(`/api/estatisticas/${childId}?period=${p}`).then((r) => r.json())
  }, [childId])

  useEffect(() => {
    Promise.all([
      fetchStats(period),
      fetch("/api/filhos").then((r) => r.json()),
    ]).then(([statsData, filhosData]) => {
      setStats(statsData)
      const child = filhosData.children?.find((c: { id: string; name: string; friendshipEnabled?: boolean; challengeEnabled?: boolean }) => c.id === childId)
      if (child) {
        setChildName(child.name)
        setSocial({
          friendshipEnabled: child.friendshipEnabled ?? false,
          challengeEnabled: child.challengeEnabled ?? false,
        })
      }
      setLoading(false)
    })
  }, [childId, fetchStats, period])

  // Fetch child's friends
  useEffect(() => {
    fetch(`/api/amizades?childId=${childId}`)
      .then((r) => r.json())
      .then((data) => setFriends(data.friends || []))
      .catch(() => {})
  }, [childId])

  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
    setStats(null)
  }

  const handleToggle = async (field: "friendshipEnabled" | "challengeEnabled") => {
    const newVal = !social[field]
    setSocial((s) => ({ ...s, [field]: newVal }))

    await fetch("/api/filhos/social", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, [field]: newVal }),
    })
  }

  const handleBlock = async (friendshipId: string, currentlyBlocked: boolean) => {
    setBlockingId(friendshipId)
    const res = await fetch(`/api/amizades/${friendshipId}/bloquear`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !currentlyBlocked }),
    })
    if (res.ok) {
      setFriends((prev) =>
        prev.map((f) =>
          f.friendshipId === friendshipId
            ? { ...f, status: currentlyBlocked ? "ACTIVE" : "BLOCKED" }
            : f
        )
      )
    }
    setBlockingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/painel" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-800">
            {childName || "Estatísticas"}
          </h1>
        </div>

        <StatsDisplay
          stats={stats}
          period={period}
          onPeriodChange={handlePeriodChange}
        />

        {/* Social controls */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-5">
          <h2 className="font-display text-lg font-bold text-gray-700 mb-4">
            Social
          </h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-700">Amizades</p>
              <p className="text-sm text-gray-500">Permitir que adicione amigos</p>
            </div>
            <button
              onClick={() => handleToggle("friendshipEnabled")}
              className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${social.friendshipEnabled ? "bg-green-500" : "bg-gray-300"}`}
              role="switch"
              aria-checked={social.friendshipEnabled}
              aria-label="Habilitar amizades"
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${social.friendshipEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-700">Desafios</p>
              <p className="text-sm text-gray-500">Receber desafios de amigos</p>
            </div>
            <button
              onClick={() => handleToggle("challengeEnabled")}
              className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${social.challengeEnabled ? "bg-green-500" : "bg-gray-300"}`}
              role="switch"
              aria-checked={social.challengeEnabled}
              aria-label="Habilitar desafios"
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${social.challengeEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Child's friends */}
          {friends.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-2">
              <p className="text-sm font-semibold text-gray-500 mb-2">
                Amigos ({friends.length})
              </p>
              <div className="flex flex-col gap-2">
                {friends.map((f) => (
                  <div key={f.friendshipId} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{f.name}</p>
                      {f.status === "BLOCKED" && (
                        <span className="text-xs text-red-500">Bloqueado</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleBlock(f.friendshipId, f.status === "BLOCKED")}
                      disabled={blockingId === f.friendshipId}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 ${
                        f.status === "BLOCKED"
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-red-50 text-red-500 hover:bg-red-100"
                      }`}
                    >
                      {f.status === "BLOCKED" ? "Desbloquear" : "Bloquear"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
