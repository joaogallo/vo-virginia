"use client"

import { useCallback, useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface Profile {
  id: string
  name: string
  email: string
  role: string
  maxRetries: number
  defaultQuestionLimit: number | null
  linkCode: string | null
  friendCode: string | null
  friendshipEnabled: boolean
  challengeEnabled: boolean
  hasPassword: boolean
}

interface LinkedAdult {
  id: string
  name: string
  email: string
  image: string | null
  role: string
}

interface PendingNameChange {
  id: string
  requestedName: string
  createdAt: string
}

interface Friend {
  id: string
  name: string
  friendshipId: string
  status: string
  blockedBy: string | null
}

interface LastSession {
  operations: string[]
  totalQuestions: number
  correctAnswers: number
  accuracy: number
}

interface LinkedChild {
  id: string
  name: string
  friendshipEnabled: boolean
  challengeEnabled: boolean
  totalSessions: number
  lastSession: LastSession | null
}

interface ChildFriend {
  id: string
  name: string
  friendshipId: string
  status: string
  blockedBy: string | null
}

const opSymbol: Record<string, string> = {
  ADDITION: "+",
  SUBTRACTION: "\u2212",
  MULTIPLICATION: "\u00d7",
  DIVISION: "\u00f7",
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [maxRetries, setMaxRetries] = useState(5)
  const [defaultQuestionLimit, setDefaultQuestionLimit] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [linkedAdults, setLinkedAdults] = useState<LinkedAdult[]>([])
  const [linkCode, setLinkCode] = useState("")
  const [linkError, setLinkError] = useState("")
  const [linkSuccess, setLinkSuccess] = useState("")
  const [linking, setLinking] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  // Name editing
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [nameMessage, setNameMessage] = useState("")
  const [nameError, setNameError] = useState("")
  const [pendingNameChange, setPendingNameChange] = useState<PendingNameChange | null>(null)

  // Linked children (for adults)
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([])
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null)
  const [childFriends, setChildFriends] = useState<Record<string, ChildFriend[]>>({})
  const [blockingId, setBlockingId] = useState<string | null>(null)
  const [deletingFriendId, setDeletingFriendId] = useState<string | null>(null)
  const [confirmDeleteFriend, setConfirmDeleteFriend] = useState<string | null>(null)

  // Friends
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendCode, setFriendCode] = useState("")
  const [addingFriend, setAddingFriend] = useState(false)
  const [friendError, setFriendError] = useState("")
  const [friendSuccess, setFriendSuccess] = useState("")
  const [generatingCode, setGeneratingCode] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const fetchAdults = useCallback(() => {
    fetch("/api/vincular")
      .then((res) => res.json())
      .then((data) => {
        if (data.adults) setLinkedAdults(data.adults)
      })
  }, [])

  const fetchPending = useCallback(() => {
    fetch("/api/notificacoes/pendentes")
      .then((res) => res.json())
      .then((data) => {
        setPendingNameChange(data.pendingNameChange ?? null)
      })
      .catch(() => {})
  }, [])

  const fetchFriends = useCallback(() => {
    fetch("/api/amizades")
      .then((res) => res.json())
      .then((data) => setFriends(data.friends || []))
      .catch(() => {})
  }, [])

  const fetchChildren = useCallback(() => {
    fetch("/api/filhos")
      .then((res) => res.json())
      .then((data) => setLinkedChildren(data.children || []))
      .catch(() => {})
  }, [])

  const fetchChildFriendsFor = useCallback((childId: string) => {
    fetch(`/api/amizades?childId=${childId}`)
      .then((res) => res.json())
      .then((data) => setChildFriends((prev) => ({ ...prev, [childId]: data.friends || [] })))
      .catch(() => {})
  }, [])

  const handleToggleChildSocial = async (childId: string, field: "friendshipEnabled" | "challengeEnabled") => {
    const child = linkedChildren.find((c) => c.id === childId)
    if (!child) return
    const newVal = !child[field]
    setLinkedChildren((prev) => prev.map((c) => c.id === childId ? { ...c, [field]: newVal } : c))
    await fetch("/api/filhos/social", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, [field]: newVal }),
    })
  }

  const handleBlockChildFriend = async (friendshipId: string, currentlyBlocked: boolean, childId: string) => {
    setBlockingId(friendshipId)
    const res = await fetch(`/api/amizades/${friendshipId}/bloquear`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !currentlyBlocked }),
    })
    if (res.ok) {
      setChildFriends((prev) => ({
        ...prev,
        [childId]: (prev[childId] || []).map((f) =>
          f.friendshipId === friendshipId
            ? { ...f, status: currentlyBlocked ? "ACTIVE" : "BLOCKED" }
            : f
        ),
      }))
    }
    setBlockingId(null)
  }

  const handleDeleteChildFriend = async (friendshipId: string, childId: string) => {
    setDeletingFriendId(friendshipId)
    const res = await fetch(`/api/amizades/${friendshipId}`, { method: "DELETE" })
    if (res.ok) {
      setChildFriends((prev) => ({
        ...prev,
        [childId]: (prev[childId] || []).filter((f) => f.friendshipId !== friendshipId),
      }))
    }
    setDeletingFriendId(null)
    setConfirmDeleteFriend(null)
  }

  useEffect(() => {
    fetch("/api/perfil")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data)
        setMaxRetries(data.maxRetries)
        setDefaultQuestionLimit(data.defaultQuestionLimit)
        if (data.role === "CHILD") {
          fetchAdults()
          fetchPending()
        }
        if (data.role !== "CHILD") {
          fetchChildren()
        }
        if (data.friendshipEnabled) {
          fetchFriends()
        }
      })
  }, [fetchAdults, fetchPending, fetchFriends, fetchChildren])

  const handleSave = async () => {
    setSaving(true)
    await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxRetries, defaultQuestionLimit }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveName = async () => {
    if (newName.trim().length < 2) {
      setNameError("Nome deve ter pelo menos 2 caracteres")
      return
    }
    setNameError("")
    setNameMessage("")
    setSavingName(true)

    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    })
    const data = await res.json()
    setSavingName(false)

    if (data.pendingApproval) {
      setNameMessage(data.message)
      setEditingName(false)
      fetchPending()
    } else if (data.name) {
      setProfile((p) => (p ? { ...p, name: data.name } : p))
      setEditingName(false)
      setNameMessage("Nome atualizado!")
      setTimeout(() => setNameMessage(""), 2000)
    } else {
      setNameError("Erro ao salvar nome")
    }
  }

  const handleCancelPending = async () => {
    await fetch("/api/notificacoes/pendentes", { method: "DELETE" })
    setPendingNameChange(null)
    setNameMessage("")
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    CHILD: "Criança",
    PARENT: "Pai/Mãe",
    TEACHER: "Professor(a)",
    ADMIN: "Administrador",
  }

  const isAdult = profile.role !== "CHILD"

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">
            {profile.role === "CHILD" ? "👧" : profile.role === "PARENT" ? "👨‍👩‍👧" : "👩‍🏫"}
          </div>

          {/* Name section - editable */}
          {editingName ? (
            <div className="flex flex-col items-center gap-2">
              <label htmlFor="perfil-edit-name" className="sr-only">Novo nome</label>
              <input
                id="perfil-edit-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                className="text-center font-display text-2xl font-bold text-gray-800 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-green-400 focus:outline-none transition-colors w-full max-w-xs"
              />
              {nameError && <p role="alert" className="text-red-500 text-sm">{nameError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="px-4 py-2 bg-green-500 text-white font-bold text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 cursor-pointer"
                >
                  {savingName ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => { setEditingName(false); setNameError("") }}
                  className="px-4 py-2 bg-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-display text-2xl font-bold text-gray-800">
                {profile.name}
              </h1>
              <button
                onClick={() => { setNewName(profile.name); setEditingName(true); setNameMessage("") }}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label="Editar nome"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
            </div>
          )}

          {/* Pending name change badge */}
          {pendingNameChange && !editingName && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                Aguardando aprovação: {pendingNameChange.requestedName}
              </span>
              <button
                onClick={handleCancelPending}
                className="text-xs text-gray-400 hover:text-red-500 cursor-pointer"
                aria-label="Cancelar solicitação"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Success/info message */}
          {nameMessage && !editingName && (
            <p role="status" className="text-green-600 text-sm font-semibold mt-1">{nameMessage}</p>
          )}

          <p className="text-gray-500">{profile.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            {roleLabels[profile.role]}
          </span>
        </div>

        {/* Configuração de tentativas */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="font-display text-lg font-bold text-gray-700 mb-4">
            Configurações
          </h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-700">Tentativas por questão</p>
              <p className="text-sm text-gray-500">
                Quantas vezes pode errar antes de avançar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMaxRetries(Math.max(1, maxRetries - 1))}
                aria-label="Diminuir tentativas"
                className="w-10 h-10 rounded-xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="font-display text-2xl font-bold text-gray-800 w-10 text-center" aria-live="polite" aria-label={`${maxRetries} tentativas`}>
                {maxRetries}
              </span>
              <button
                onClick={() => setMaxRetries(Math.min(20, maxRetries + 1))}
                aria-label="Aumentar tentativas"
                className="w-10 h-10 rounded-xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-700">Questões por sessão</p>
              <p className="text-sm text-gray-500">
                Quantidade padrão ao iniciar uma sessão
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (defaultQuestionLimit === null) {
                    setDefaultQuestionLimit(20)
                  } else if (defaultQuestionLimit <= 5) {
                    setDefaultQuestionLimit(null)
                  } else {
                    setDefaultQuestionLimit(defaultQuestionLimit - 5)
                  }
                }}
                aria-label="Diminuir questões por sessão"
                className="w-10 h-10 rounded-xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="font-display text-lg font-bold text-gray-800 min-w-[4ch] text-center" aria-live="polite" aria-label={`${defaultQuestionLimit ?? "Todas as"} questões`}>
                {defaultQuestionLimit ?? "Todas"}
              </span>
              <button
                onClick={() => {
                  if (defaultQuestionLimit === null) return
                  const next = defaultQuestionLimit + 5
                  setDefaultQuestionLimit(next > 500 ? null : next)
                }}
                aria-label="Aumentar questões por sessão"
                className="w-10 h-10 rounded-xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-display text-lg font-bold rounded-xl py-3 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
          </button>
        </div>

        {/* Código de vinculação (para pais/professores) */}
        {profile.linkCode && (
          <div className="border-t border-gray-100 pt-6 mt-6">
            <h2 className="font-display text-lg font-bold text-gray-700 mb-2">
              Código de vinculação
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Compartilhe este código com a criança para que ela vincule a conta a você.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <span className="font-mono text-3xl font-bold text-gray-800 tracking-wider">
                {profile.linkCode}
              </span>
            </div>
          </div>
        )}

        {/* Crianças vinculadas (para adultos) */}
        {isAdult && linkedChildren.length > 0 && (
          <div className="border-t border-gray-100 pt-6 mt-6">
            <h2 className="font-display text-lg font-bold text-gray-700 mb-4">
              Crianças vinculadas
            </h2>
            <div className="flex flex-col gap-3">
              {linkedChildren.map((child) => (
                <div key={child.id} className="bg-gray-50 rounded-xl overflow-hidden">
                  {/* Child header */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-lg">
                        👧
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{child.name}</p>
                        {child.lastSession ? (
                          <p className="text-xs text-gray-500">
                            {child.lastSession.operations.map((op) => opSymbol[op] || op).join(" ")}{" "}
                            &middot; {child.lastSession.correctAnswers}/{child.lastSession.totalQuestions} ({child.lastSession.accuracy}%)
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400">Nenhuma sessão ainda</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/painel/${child.id}`}
                        className="flex-1 text-center py-2 bg-green-50 text-green-600 text-xs font-bold rounded-lg hover:bg-green-100"
                      >
                        Estatísticas
                      </Link>
                      <button
                        onClick={() => {
                          const opening = expandedChildId !== child.id
                          setExpandedChildId(opening ? child.id : null)
                          if (opening && !childFriends[child.id]) {
                            fetchChildFriendsFor(child.id)
                          }
                        }}
                        className="flex-1 text-center py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 cursor-pointer"
                      >
                        {expandedChildId === child.id ? "Fechar" : "Configurações"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded settings */}
                  <AnimatePresence>
                    {expandedChildId === child.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-gray-200 pt-3">
                          {/* Social toggles */}
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-gray-700">Amizades</p>
                            <button
                              onClick={() => handleToggleChildSocial(child.id, "friendshipEnabled")}
                              className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${child.friendshipEnabled ? "bg-green-500" : "bg-gray-300"}`}
                              role="switch"
                              aria-checked={child.friendshipEnabled}
                              aria-label={`Habilitar amizades para ${child.name}`}
                            >
                              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${child.friendshipEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-gray-700">Desafios</p>
                            <button
                              onClick={() => handleToggleChildSocial(child.id, "challengeEnabled")}
                              className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${child.challengeEnabled ? "bg-green-500" : "bg-gray-300"}`}
                              role="switch"
                              aria-checked={child.challengeEnabled}
                              aria-label={`Habilitar desafios para ${child.name}`}
                            >
                              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${child.challengeEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                            </button>
                          </div>

                          {/* Child's friends */}
                          {(childFriends[child.id] || []).length > 0 && (
                            <div className="border-t border-gray-200 pt-3 mt-1">
                              <p className="text-xs font-semibold text-gray-500 mb-2">
                                Amigos ({childFriends[child.id].length})
                              </p>
                              <div className="flex flex-col gap-2">
                                {childFriends[child.id].map((f) => (
                                  <div key={f.friendshipId} className="flex items-center justify-between bg-white rounded-lg p-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-800 text-xs truncate">{f.name}</p>
                                      {f.status === "BLOCKED" && (
                                        <span className="text-[10px] text-red-500">Bloqueado</span>
                                      )}
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                      <button
                                        onClick={() => handleBlockChildFriend(f.friendshipId, f.status === "BLOCKED", child.id)}
                                        disabled={blockingId === f.friendshipId}
                                        className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer disabled:opacity-50 ${
                                          f.status === "BLOCKED"
                                            ? "bg-green-50 text-green-600"
                                            : "bg-red-50 text-red-500"
                                        }`}
                                      >
                                        {f.status === "BLOCKED" ? "Desbloquear" : "Bloquear"}
                                      </button>
                                      {confirmDeleteFriend === f.friendshipId ? (
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => handleDeleteChildFriend(f.friendshipId, child.id)}
                                            disabled={deletingFriendId === f.friendshipId}
                                            className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded cursor-pointer disabled:opacity-50"
                                          >
                                            {deletingFriendId === f.friendshipId ? "..." : "Sim"}
                                          </button>
                                          <button
                                            onClick={() => setConfirmDeleteFriend(null)}
                                            className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] font-bold rounded cursor-pointer"
                                          >
                                            Não
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setConfirmDeleteFriend(f.friendshipId)}
                                          className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded hover:bg-gray-200 cursor-pointer"
                                        >
                                          Excluir
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adultos vinculados (para crianças) */}
        {profile.role === "CHILD" && (
          <div className="border-t border-gray-100 pt-6 mt-6">
            <h2 className="font-display text-lg font-bold text-gray-700 mb-4">
              Adultos vinculados
            </h2>

            {linkedAdults.length > 0 ? (
              <div className="flex flex-col gap-3 mb-6">
                {linkedAdults.map((adult) => (
                  <div
                    key={adult.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                  >
                    <div className="text-2xl">
                      {adult.role === "PARENT" ? "👨‍👩‍👧" : "👩‍🏫"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{adult.name}</p>
                      <p className="text-sm text-gray-500 truncate">{adult.email}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1 font-semibold">
                      {adult.role === "PARENT" ? "Pai/Mãe" : "Professor(a)"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm mb-4">
                Nenhum adulto vinculado ainda.
              </p>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setLinkError("")
                setLinkSuccess("")
                setLinking(true)

                const res = await fetch("/api/vincular", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ linkCode }),
                })

                setLinking(false)
                const data = await res.json()

                if (res.ok) {
                  setLinkSuccess(`Vinculado a ${data.adultName}!`)
                  setLinkCode("")
                  fetchAdults()
                } else {
                  setLinkError(data.error || "Erro ao vincular")
                }
              }}
              className="flex flex-col gap-3"
            >
              <p className="text-sm text-gray-500">
                Peça o código de vinculação ao seu pai, mãe ou professor(a).
              </p>
              <div className="flex gap-2">
                <label htmlFor="perfil-linkcode" className="sr-only">Código do adulto</label>
                <input
                  id="perfil-linkcode"
                  type="text"
                  placeholder="Código do adulto"
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                  required
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-lg font-mono tracking-wider text-center uppercase focus:border-green-400 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={linking || !linkCode}
                  className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-xl shadow disabled:opacity-50 cursor-pointer"
                >
                  {linking ? "..." : "Vincular"}
                </button>
              </div>
              {linkError && (
                <p role="alert" className="text-red-500 text-sm text-center">{linkError}</p>
              )}
              {linkSuccess && (
                <p role="status" className="text-green-600 text-sm text-center font-semibold">{linkSuccess}</p>
              )}
            </form>
          </div>
        )}

        {/* Social (amizades / desafios) */}
        <div className="border-t border-gray-100 pt-6 mt-6">
          <h2 className="font-display text-lg font-bold text-gray-700 mb-4">
            Amigos
          </h2>

          {/* Toggles */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-700">Amizades</p>
              <p className="text-sm text-gray-500">Permitir adicionar amigos</p>
            </div>
            {profile.role === "CHILD" && linkedAdults.length > 0 ? (
              <div className="flex items-center gap-2">
                <div
                  className={`w-12 h-7 rounded-full relative ${profile.friendshipEnabled ? "bg-green-300" : "bg-gray-200"} opacity-50`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${profile.friendshipEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-xs text-gray-400">Controlado pelo responsável</span>
              </div>
            ) : (
              <button
                onClick={async () => {
                  const newVal = !profile.friendshipEnabled
                  setProfile((p) => p ? { ...p, friendshipEnabled: newVal } : p)
                  await fetch("/api/perfil", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ friendshipEnabled: newVal }),
                  })
                  if (newVal) fetchFriends()
                }}
                className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${profile.friendshipEnabled ? "bg-green-500" : "bg-gray-300"}`}
                role="switch"
                aria-checked={profile.friendshipEnabled}
                aria-label="Habilitar amizades"
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${profile.friendshipEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-700">Desafios</p>
              <p className="text-sm text-gray-500">Receber desafios de amigos</p>
            </div>
            {profile.role === "CHILD" && linkedAdults.length > 0 ? (
              <div className="flex items-center gap-2">
                <div
                  className={`w-12 h-7 rounded-full relative ${profile.challengeEnabled ? "bg-green-300" : "bg-gray-200"} opacity-50`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${profile.challengeEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-xs text-gray-400">Controlado pelo responsável</span>
              </div>
            ) : (
              <button
                onClick={async () => {
                  const newVal = !profile.challengeEnabled
                  setProfile((p) => p ? { ...p, challengeEnabled: newVal } : p)
                  await fetch("/api/perfil", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ challengeEnabled: newVal }),
                  })
                }}
                className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${profile.challengeEnabled ? "bg-green-500" : "bg-gray-300"}`}
                role="switch"
                aria-checked={profile.challengeEnabled}
                aria-label="Habilitar desafios"
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${profile.challengeEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            )}
          </div>

          {/* Friends section (when enabled) */}
          {profile.friendshipEnabled && (
            <>
              {/* My friend code */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 mb-2">Meu código de amigo</p>
                {profile.friendCode ? (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-gray-800 tracking-wider">
                      {profile.friendCode}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(profile.friendCode!)}
                      className="px-4 py-2 bg-green-50 text-green-600 text-sm font-bold rounded-lg hover:bg-green-100 cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      setGeneratingCode(true)
                      const res = await fetch("/api/amizades/codigo", { method: "POST" })
                      if (res.ok) {
                        const data = await res.json()
                        setProfile((p) => p ? { ...p, friendCode: data.friendCode } : p)
                      }
                      setGeneratingCode(false)
                    }}
                    disabled={generatingCode}
                    className="w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-xl shadow disabled:opacity-50 cursor-pointer"
                  >
                    {generatingCode ? "Gerando..." : "Gerar meu código"}
                  </button>
                )}
              </div>

              {/* Add friend */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setFriendError("")
                  setFriendSuccess("")
                  setAddingFriend(true)

                  const res = await fetch("/api/amizades", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ friendCode: friendCode.trim().toUpperCase() }),
                  })

                  const data = await res.json()
                  setAddingFriend(false)

                  if (res.ok) {
                    setFriendSuccess(`Amizade com ${data.friendName} criada!`)
                    setFriendCode("")
                    fetchFriends()
                    setTimeout(() => setFriendSuccess(""), 3000)
                  } else {
                    setFriendError(data.error || "Erro ao adicionar amigo")
                  }
                }}
                className="flex gap-2 mb-2"
              >
                <label htmlFor="perfil-friend-code" className="sr-only">Código do amigo</label>
                <input
                  id="perfil-friend-code"
                  type="text"
                  placeholder="Código do amigo"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  required
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-lg font-mono tracking-wider text-center uppercase focus:border-green-400 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={addingFriend || !friendCode.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-xl shadow disabled:opacity-50 cursor-pointer"
                >
                  {addingFriend ? "..." : "Adicionar"}
                </button>
              </form>
              {friendError && <p role="alert" className="text-red-500 text-sm text-center mb-2">{friendError}</p>}
              {friendSuccess && <p role="status" className="text-green-600 text-sm text-center font-semibold mb-2">{friendSuccess}</p>}

              {/* Friends list */}
              <p className="text-gray-500 text-sm mt-4 mb-2">{friends.length} amigos</p>
              {friends.length === 0 ? (
                <p className="text-gray-400 text-sm">Compartilhe seu código com seus amigos!</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <AnimatePresence>
                    {friends.map((friend) => (
                      <motion.div
                        key={friend.friendshipId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                            👧
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate text-sm">{friend.name}</p>
                            {friend.status === "BLOCKED" && (
                              <span className="text-xs text-red-500 font-semibold">Bloqueado</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {friend.status === "ACTIVE" && profile.challengeEnabled && (
                            <Link
                              href={`/amigos?desafiar=${friend.id}`}
                              className="px-2 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-lg hover:bg-orange-100"
                            >
                              Desafiar
                            </Link>
                          )}
                          {confirmRemove === friend.friendshipId ? (
                            <div className="flex gap-1">
                              <button
                                onClick={async () => {
                                  setRemovingId(friend.friendshipId)
                                  const res = await fetch(`/api/amizades/${friend.friendshipId}`, { method: "DELETE" })
                                  if (res.ok) setFriends((prev) => prev.filter((f) => f.friendshipId !== friend.friendshipId))
                                  setRemovingId(null)
                                  setConfirmRemove(null)
                                }}
                                disabled={removingId === friend.friendshipId}
                                className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg disabled:opacity-50 cursor-pointer"
                              >
                                {removingId === friend.friendshipId ? "..." : "Sim"}
                              </button>
                              <button
                                onClick={() => setConfirmRemove(null)}
                                className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRemove(friend.friendshipId)}
                              className="px-2 py-1 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 cursor-pointer"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>

        {/* Alterar / Criar senha */}
        <div className="border-t border-gray-100 pt-6 mt-6">
          <h2 className="font-display text-lg font-bold text-gray-700 mb-2">
            {profile.hasPassword ? "Alterar senha" : "Criar senha"}
          </h2>
          {!profile.hasPassword && (
            <p className="text-sm text-gray-500 mb-3">
              Você entrou com Google ou Microsoft. Crie uma senha para também poder entrar com e-mail e senha.
            </p>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setPasswordError("")
              setPasswordSuccess("")

              if (newPassword.length < 6) {
                setPasswordError("Senha deve ter pelo menos 6 caracteres")
                return
              }
              if (newPassword !== confirmPassword) {
                setPasswordError("As senhas não coincidem")
                return
              }

              setSavingPassword(true)
              const res = await fetch("/api/auth/alterar-senha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...(profile.hasPassword ? { currentPassword } : {}),
                  newPassword,
                }),
              })
              setSavingPassword(false)

              if (res.ok) {
                setPasswordSuccess(profile.hasPassword ? "Senha alterada!" : "Senha criada!")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
                setProfile({ ...profile, hasPassword: true })
                setTimeout(() => setPasswordSuccess(""), 3000)
              } else {
                const data = await res.json()
                setPasswordError(data.error || "Erro ao salvar senha")
              }
            }}
            className="flex flex-col gap-3"
          >
            {profile.hasPassword && (
              <div>
                <label htmlFor="perfil-current-password" className="sr-only">Senha atual</label>
                <input
                  id="perfil-current-password"
                  type="password"
                  placeholder="Senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors"
                />
              </div>
            )}
            <div>
              <label htmlFor="perfil-new-password" className="sr-only">Nova senha</label>
              <input
                id="perfil-new-password"
                type="password"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="perfil-confirm-password" className="sr-only">Confirmar nova senha</label>
              <input
                id="perfil-confirm-password"
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors"
              />
            </div>
            {passwordError && (
              <p role="alert" className="text-red-500 text-sm text-center">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p role="status" className="text-green-600 text-sm text-center font-semibold">{passwordSuccess}</p>
            )}
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-display text-lg font-bold rounded-xl py-3 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {savingPassword
                ? "Salvando..."
                : profile.hasPassword
                  ? "Alterar senha"
                  : "Criar senha"}
            </button>
          </form>
        </div>

        {/* Sair */}
        <div className="border-t border-gray-100 pt-6 mt-6">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-display text-lg font-bold hover:bg-red-50 transition-colors cursor-pointer"
          >
            Sair da conta
          </button>
        </div>
      </motion.div>
    </div>
  )
}
