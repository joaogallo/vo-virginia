"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface Friend {
  id: string
  name: string
  friendshipId: string
  status: string
  blockedBy: string | null
}

interface Profile {
  friendshipEnabled: boolean
  challengeEnabled: boolean
  friendCode: string | null
}

export default function AmigosPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [generatingCode, setGeneratingCode] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const fetchFriends = useCallback(() => {
    fetch("/api/amizades")
      .then((res) => res.json())
      .then((data) => setFriends(data.friends || []))
  }, [])

  useEffect(() => {
    Promise.all([
      fetch("/api/amizades").then((r) => r.json()),
      fetch("/api/perfil").then((r) => r.json()),
    ]).then(([friendsData, profileData]) => {
      setFriends(friendsData.friends || [])
      setProfile(profileData)
      setLoading(false)
    })
  }, [])

  const handleGenerateCode = async () => {
    setGeneratingCode(true)
    const res = await fetch("/api/amizades/codigo", { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      setProfile((p) => p ? { ...p, friendCode: data.friendCode } : p)
    }
    setGeneratingCode(false)
  }

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setAdding(true)

    const res = await fetch("/api/amizades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendCode: code.trim().toUpperCase() }),
    })

    const data = await res.json()
    setAdding(false)

    if (res.ok) {
      setSuccess(`Amizade com ${data.friendName} criada!`)
      setCode("")
      fetchFriends()
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(data.error || "Erro ao adicionar amigo")
    }
  }

  const handleRemove = async (friendshipId: string) => {
    setRemovingId(friendshipId)
    const res = await fetch(`/api/amizades/${friendshipId}`, { method: "DELETE" })
    if (res.ok) {
      setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId))
    }
    setRemovingId(null)
    setConfirmRemove(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!profile?.friendshipEnabled) {
    return (
      <div className="w-full max-w-lg mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-display text-2xl font-bold text-gray-800 mb-2">
            Amizades desabilitadas
          </h1>
          <p className="text-gray-500 mb-4">
            Para adicionar amigos, habilite as amizades no seu perfil.
          </p>
          <Link
            href="/perfil"
            className="inline-block bg-gradient-to-r from-blue-400 to-blue-600 text-white font-display text-lg font-bold rounded-xl py-3 px-6 shadow-lg"
          >
            Ir para Perfil
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">
          Amigos
        </h1>

        {/* My friend code */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <h2 className="font-display text-sm font-bold text-gray-500 mb-2">
            Meu código de amigo
          </h2>
          {profile.friendCode ? (
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold text-gray-800 tracking-wider">
                {profile.friendCode}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(profile.friendCode!)}
                className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-100 cursor-pointer"
              >
                Copiar
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateCode}
              disabled={generatingCode}
              className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-xl shadow disabled:opacity-50 cursor-pointer"
            >
              {generatingCode ? "Gerando..." : "Gerar meu código"}
            </button>
          )}
        </div>

        {/* Add friend */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <h2 className="font-display text-sm font-bold text-gray-500 mb-3">
            Adicionar amigo
          </h2>
          <form onSubmit={handleAddFriend} className="flex gap-2">
            <label htmlFor="friend-code-input" className="sr-only">Código do amigo</label>
            <input
              id="friend-code-input"
              type="text"
              placeholder="Código do amigo"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-lg font-mono tracking-wider text-center uppercase focus:border-blue-400 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={adding || !code.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-xl shadow disabled:opacity-50 cursor-pointer"
            >
              {adding ? "..." : "Adicionar"}
            </button>
          </form>
          {error && <p role="alert" className="text-red-500 text-sm text-center mt-2">{error}</p>}
          {success && <p role="status" className="text-green-600 text-sm text-center font-semibold mt-2">{success}</p>}
        </div>

        {/* Friends list */}
        <p className="text-gray-500 text-sm mb-3">{friends.length} amigos</p>

        {friends.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">👋</div>
            <p className="text-gray-500 text-lg">
              Compartilhe seu código com seus amigos!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {friends.map((friend, i) => (
                <motion.div
                  key={friend.friendshipId}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                        👧
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{friend.name}</p>
                        {friend.status === "BLOCKED" && (
                          <span className="text-xs text-red-500 font-semibold">Bloqueado</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {friend.status === "ACTIVE" && profile.challengeEnabled && (
                        <Link
                          href={`/amigos?desafiar=${friend.id}`}
                          className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-lg hover:bg-orange-100"
                        >
                          Desafiar
                        </Link>
                      )}

                      {confirmRemove === friend.friendshipId ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleRemove(friend.friendshipId)}
                            disabled={removingId === friend.friendshipId}
                            className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                          >
                            {removingId === friend.friendshipId ? "..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setConfirmRemove(null)}
                            className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-300 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRemove(friend.friendshipId)}
                          className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}
