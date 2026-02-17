"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

interface Child {
  id: string
  name: string
  email: string
  totalSessions: number
}

export default function FilhosPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchChildren = () => {
    fetch("/api/filhos")
      .then((res) => res.json())
      .then((data) => setChildren(data.children || []))
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const body: Record<string, string> = {}
    if (email) body.childEmail = email
    if (code) body.linkCode = code

    const res = await fetch("/api/filhos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setLoading(false)

    if (res.ok) {
      setSuccess("Criança vinculada com sucesso!")
      setEmail("")
      setCode("")
      fetchChildren()
    } else {
      const data = await res.json()
      setError(data.error || "Erro ao vincular")
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/painel" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-800">
            Gerenciar Crianças
          </h1>
        </div>

        {/* Formulário de vinculação */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="font-display text-lg font-bold text-gray-700 mb-4">
            Vincular nova criança
          </h2>
          <form onSubmit={handleLink} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email da criança"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-lg focus:border-green-400 focus:outline-none"
            />
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <input
              type="text"
              placeholder="Código de vinculação"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-lg focus:border-green-400 focus:outline-none"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={loading || (!email && !code)}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-display text-lg font-bold rounded-xl py-3 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Vinculando..." : "Vincular"}
            </button>
          </form>
        </div>

        {/* Lista de crianças */}
        {children.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-bold text-gray-700">
              Crianças vinculadas
            </h2>
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                  👧
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{child.name}</p>
                  <p className="text-sm text-gray-500">{child.email}</p>
                </div>
                <span className="text-sm text-gray-400">
                  {child.totalSessions} sessões
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
