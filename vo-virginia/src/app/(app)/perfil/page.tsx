"use client"

import { useCallback, useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { motion } from "framer-motion"

interface Profile {
  id: string
  name: string
  email: string
  role: string
  maxRetries: number
  defaultQuestionLimit: number | null
  linkCode: string | null
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
      })
  }, [fetchAdults, fetchPending])

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
  }

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
