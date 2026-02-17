"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function CadastroPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"CHILD" | "PARENT" | "TEACHER">("CHILD")
  const [linkCode, setLinkCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, linkCode: linkCode || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao cadastrar")
        setLoading(false)
        return
      }

      // Login automático após cadastro
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      window.location.href = "/jogar"
    } catch {
      setError("Erro ao cadastrar. Tente novamente.")
      setLoading(false)
    }
  }

  const roles = [
    { value: "CHILD" as const, label: "Criança", icon: "👧" },
    { value: "PARENT" as const, label: "Pai/Mãe", icon: "👨‍👩‍👧" },
    { value: "TEACHER" as const, label: "Professor(a)", icon: "👩‍🏫" },
  ]

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🦉</div>
        <h1 className="font-display text-3xl font-bold text-gray-800">Cadastro</h1>
        <p className="text-gray-500 mt-1">Crie sua conta!</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Seleção de perfil */}
        <div>
          <label className="text-sm font-semibold text-gray-600 mb-2 block">Eu sou:</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`
                  rounded-xl p-3 flex flex-col items-center gap-1 border-2 transition-all cursor-pointer
                  ${role === r.value
                    ? "border-green-400 bg-green-50 shadow"
                    : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <span className="text-2xl">{r.icon}</span>
                <span className="text-xs font-semibold text-gray-700">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-lg focus:border-green-400 focus:outline-none transition-colors"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-lg focus:border-green-400 focus:outline-none transition-colors"
        />
        <input
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-lg focus:border-green-400 focus:outline-none transition-colors"
        />

        {/* Código de vinculação (apenas para crianças) */}
        {role === "CHILD" && (
          <input
            type="text"
            placeholder="Código do responsável (opcional)"
            value={linkCode}
            onChange={(e) => setLinkCode(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-lg focus:border-green-400 focus:outline-none transition-colors"
          />
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-display text-xl font-bold rounded-xl py-3 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <p className="text-center text-gray-500 mt-6">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-green-600 font-semibold hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
