"use client"

import { useRouter } from "next/navigation"
import { useGameStore } from "@/stores/game-store"
import SessionSetup from "@/components/game/SessionSetup"

export default function JogarPage() {
  const router = useRouter()
  const startSession = useGameStore((s) => s.startSession)

  const handleStart = () => {
    startSession(5) // maxRetries padrão
    router.push("/jogar/sessao")
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <SessionSetup onStart={handleStart} />
    </div>
  )
}
