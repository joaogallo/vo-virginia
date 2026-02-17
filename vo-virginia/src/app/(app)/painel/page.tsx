"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

interface Child {
  id: string
  name: string
  email: string
  lastSessionAt: string | null
  totalSessions: number
}

export default function PainelPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/filhos")
      .then((res) => res.json())
      .then((data) => {
        setChildren(data.children || [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-gray-800">
            Painel
          </h1>
          <Link
            href="/painel/filhos"
            className="text-sm font-semibold text-green-600 hover:underline"
          >
            Gerenciar
          </Link>
        </div>

        {children.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">👨‍👩‍👧</div>
            <p className="text-gray-500 text-lg mb-4">
              Nenhuma criança vinculada ainda.
            </p>
            <Link
              href="/painel/filhos"
              className="inline-block bg-gradient-to-r from-green-400 to-green-600 text-white font-display text-lg font-bold rounded-xl py-3 px-6 shadow-lg"
            >
              Vincular criança
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {children.map((child, i) => (
              <motion.div
                key={child.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/painel/${child.id}`}
                  className="block bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">
                      👧
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-gray-800">
                        {child.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {child.totalSessions} sessões
                        {child.lastSessionAt && (
                          <> &middot; Última: {new Date(child.lastSessionAt).toLocaleDateString("pt-BR")}</>
                        )}
                      </p>
                    </div>
                    <span className="text-gray-400 text-xl">&rarr;</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
