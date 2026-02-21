"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function NavLinks() {
  const { data: session } = useSession()
  const isAdult = session?.user?.role === "PARENT" || session?.user?.role === "TEACHER"

  return (
    <nav className="flex items-center gap-4">
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
    </nav>
  )
}
