"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { useGameStore } from "@/stores/game-store"
import ChallengeGameContainer from "@/components/challenge/ChallengeGameContainer"

export default function DesafioSessaoPage() {
  const router = useRouter()
  const gameState = useGameStore((s) => s.gameState)

  useEffect(() => {
    if (!gameState) {
      router.replace("/desafios")
    }
  }, [gameState, router])

  const handleSessionComplete = useCallback(() => {
    router.push("/desafios/resultado")
  }, [router])

  if (!gameState) return null

  return (
    <div className="w-full">
      <ChallengeGameContainer onSessionComplete={handleSessionComplete} />
    </div>
  )
}
