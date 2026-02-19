"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/stores/game-store"
import SessionSetup from "@/components/game/SessionSetup"

interface UserProfile {
  maxRetries: number
  defaultQuestionLimit: number | null
}

export default function JogarPage() {
  const router = useRouter()
  const { startSession, setQuestionLimit, totalQuestions } = useGameStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetch("/api/perfil")
      .then((res) => res.json())
      .then((data: UserProfile) => {
        setProfile(data)
        if (data.defaultQuestionLimit !== null) {
          setQuestionLimit(data.defaultQuestionLimit)
        }
      })
  }, [setQuestionLimit])

  const handleStart = () => {
    const maxRetries = profile?.maxRetries ?? 5
    startSession(maxRetries)
    router.push("/jogar/sessao")
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <SessionSetup onStart={handleStart} />
    </div>
  )
}
