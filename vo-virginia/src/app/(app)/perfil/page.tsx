"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Profile {
  id: string
  name: string
  email: string
  role: string
  maxRetries: number
  linkCode: string | null
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [maxRetries, setMaxRetries] = useState(5)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/perfil")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data)
        setMaxRetries(data.maxRetries)
      })
  }, [])

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
      </motion.div>
    </div>
  )
}
