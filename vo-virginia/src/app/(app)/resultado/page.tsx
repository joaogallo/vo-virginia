"use client"

import { useRouter } from "next/navigation"
import { useGameStore } from "@/stores/game-store"
import SessionSummary from "@/components/game/SessionSummary"

export default function ResultadoPage() {
  const router = useRouter()
  const resetSetup = useGameStore((s) => s.resetSetup)

  const handlePlayAgain = () => {
    resetSetup()
    router.push("/jogar")
  }

  const handleGoHome = () => {
    resetSetup()
    router.push("/")
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <SessionSummary onPlayAgain={handlePlayAgain} onGoHome={handleGoHome} />
    </div>
  )
}
