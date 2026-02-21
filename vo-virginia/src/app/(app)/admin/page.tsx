"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastSessionAt: string | null
  totalSessions: number
}

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  CHILD: { label: "Criança", className: "bg-yellow-100 text-yellow-700" },
  PARENT: { label: "Pai/Mãe", className: "bg-blue-100 text-blue-700" },
  TEACHER: { label: "Professor", className: "bg-purple-100 text-purple-700" },
  ADMIN: { label: "Admin", className: "bg-red-100 text-red-700" },
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/usuarios")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold text-gray-800 text-center mb-1">
          Admin
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {users.length} usuários cadastrados
        </p>

        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-red-400 focus:outline-none text-gray-700"
        />

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((user, i) => {
              const badge = ROLE_BADGES[user.role] || ROLE_BADGES.CHILD
              return (
                <motion.div
                  key={user.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/admin/${user.id}`}
                    className="block bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg font-bold text-gray-800 truncate">
                            {user.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {user.totalSessions} sessões
                          {user.lastSessionAt && (
                            <>
                              {" "}
                              &middot; Última:{" "}
                              {new Date(user.lastSessionAt).toLocaleDateString(
                                "pt-BR"
                              )}
                            </>
                          )}
                          {" "}&middot; Cadastro:{" "}
                          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span className="text-gray-400 text-xl">&rarr;</span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
