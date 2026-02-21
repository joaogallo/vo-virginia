"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function NavLinks() {
  const { data: session } = useSession()
  const isAdult = session?.user?.role === "PARENT" || session?.user?.role === "TEACHER"
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <nav aria-label="Menu principal" className="flex items-center gap-4">
      <Link href="/medalhas" className="text-sm font-semibold text-gray-600 hover:text-gray-800">
        Medalhas
      </Link>
      <Link href="/estatisticas" className="text-sm font-semibold text-gray-600 hover:text-gray-800">
        Estatísticas
      </Link>
      {isAdult && (
        <Link href="/painel" className="text-sm font-semibold text-gray-600 hover:text-gray-800">
          Painel
        </Link>
      )}
      <Link href="/feedback" className="text-sm font-semibold text-gray-600 hover:text-gray-800">
        Feedback
      </Link>
      <Link href="/perfil" className="text-sm font-semibold text-gray-600 hover:text-gray-800">
        Perfil
      </Link>
      {isAdmin && (
        <Link href="/admin" className="text-sm font-semibold text-red-500 hover:text-red-700">
          Admin
        </Link>
      )}
    </nav>
  )
}
