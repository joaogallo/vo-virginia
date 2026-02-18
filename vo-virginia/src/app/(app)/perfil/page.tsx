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

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [maxRetries, setMaxRetries] = useState(5)
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

  const fetchAdults = useCallback(() => {
    fetch("/api/vincular")
      .then((res) => res.json())
      .then((data) => {
        if (data.adults) setLinkedAdults(data.adults)
      })
  }, [])

  useEffect(() => {
    fetch("/api/perfil")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data)
        setMaxRetries(data.maxRetries)
        if (data.role === "CHILD") fetchAdults()
      })
  }, [fetchAdults])

  const handleSave = async () => {
    setSaving(true)
    await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxRetries }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
          <h1 className="font-display text-2xl font-bold text-gray-800">
            {profile.name}
          </h1>
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
                className="w-10 h-10 rounded-xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="font-display text-2xl font-bold text-gray-800 w-10 text-center">
                {maxRetries}
              </span>
              <button
                onClick={() => setMaxRetries(Math.min(20, maxRetries + 1))}
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
                <input
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
                <p className="text-red-500 text-sm text-center">{linkError}</p>
              )}
              {linkSuccess && (
                <p className="text-green-600 text-sm text-center font-semibold">{linkSuccess}</p>
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
              <input
                type="password"
                placeholder="Senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors"
              />
            )}
            <input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors"
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors"
            />
            {passwordError && (
              <p className="text-red-500 text-sm text-center">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-600 text-sm text-center font-semibold">{passwordSuccess}</p>
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
