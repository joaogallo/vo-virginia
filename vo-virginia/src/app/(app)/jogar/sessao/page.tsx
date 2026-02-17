"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { useGameStore } from "@/stores/game-store"
import GameContainer from "@/components/game/GameContainer"

export default function SessaoPage() {
  const router = useRouter()
  const gameState = useGameStore((s) => s.gameState)

  // Redirecionar se não há sessão ativa
  useEffect(() => {
    if (!gameState) {
      router.replace("/jogar")
    }
  }, [gameState, router])

  const handleSessionComplete = useCallback(() => {
    router.push("/resultado")
  }, [router])

  if (!gameState) return null

  return (
    <div className="w-full">
      <GameContainer onSessionComplete={handleSessionComplete} />
    </div>
  )
}
