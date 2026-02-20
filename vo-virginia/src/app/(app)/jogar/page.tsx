"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/stores/game-store"
import { loadSession, clearSession } from "@/lib/session-storage"
import type { PersistedSession } from "@/lib/session-storage"
import type { Operation } from "@/types/game"
import SessionSetup from "@/components/game/SessionSetup"
import SessionRecoveryDialog from "@/components/game/SessionRecoveryDialog"

const OPERATION_MAP: Record<Operation, string> = {
  addition: "ADDITION",
  subtraction: "SUBTRACTION",
  multiplication: "MULTIPLICATION",
  division: "DIVISION",
}

interface UserProfile {
  maxRetries: number
  defaultQuestionLimit: number | null
}

export default function JogarPage() {
  const router = useRouter()
  const { startSession, setQuestionLimit, restoreSession, setBackendSessionId } = useGameStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recoverySession, setRecoverySession] = useState<PersistedSession | null>(null)
  const [checked, setChecked] = useState(false)

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

  // Check for stored session on mount
  useEffect(() => {
    const stored = loadSession()
    if (stored) {
      setRecoverySession(stored)
    }
    setChecked(true)
  }, [])

  const handleResume = () => {
    if (!recoverySession) return
    restoreSession(recoverySession)
    setRecoverySession(null)
    router.push("/jogar/sessao")
  }

  const handleDiscard = () => {
    clearSession()
    setRecoverySession(null)
  }

  const handleStart = async () => {
    const maxRetries = profile?.maxRetries ?? 5
    startSession(maxRetries)

    const state = useGameStore.getState()
    const ops = state.selectedOperations.map((op) => OPERATION_MAP[op])
    const nums = state.selectedNumbers
    const totalQuestions = state.gameState?.sessionTotal

    // Create backend session immediately
    try {
      const res = await fetch("/api/sessoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operations: ops,
          numbers: nums,
          totalQuestions,
        }),
      })
      if (res.ok) {
        const session = await res.json()
        setBackendSessionId(session.id)
      }
    } catch {
      // Continue without backend session — will save at end
    }

    router.push("/jogar/sessao")
  }

  if (!checked) return null

  if (recoverySession) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8">
        <SessionRecoveryDialog
          session={recoverySession}
          onResume={handleResume}
          onDiscard={handleDiscard}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <SessionSetup onStart={handleStart} />
    </div>
  )
}
