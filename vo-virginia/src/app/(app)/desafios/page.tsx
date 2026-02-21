"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/stores/game-store"
import { loadSession, clearSession } from "@/lib/session-storage"
import { buildQuestion } from "@/lib/game-engine"
import type { PersistedSession } from "@/lib/session-storage"
import type { Operation, Question, SessionMode } from "@/types/game"
import ChallengeSetup from "@/components/challenge/ChallengeSetup"
import ChallengeHistory from "@/components/challenge/ChallengeHistory"
import SessionRecoveryDialog from "@/components/game/SessionRecoveryDialog"

const OPERATION_MAP: Record<Operation, string> = {
  addition: "ADDITION",
  subtraction: "SUBTRACTION",
  multiplication: "MULTIPLICATION",
  division: "DIVISION",
}

const REVERSE_OPERATION_MAP: Record<string, Operation> = {
  ADDITION: "addition",
  SUBTRACTION: "subtraction",
  MULTIPLICATION: "multiplication",
  DIVISION: "division",
}

const SESSION_MODE_API_MAP: Record<SessionMode, string> = {
  practice: "PRACTICE",
  timed_total: "TIMED_TOTAL",
  timed_per_question: "TIMED_PER_QUESTION",
  marathon: "MARATHON",
  review: "REVIEW",
}

interface UserProfile {
  maxRetries: number
  defaultQuestionLimit: number | null
}

interface MissedQuestion {
  operation: string
  firstOperand: number
  secondOperand: number
  correctAnswer: number
  errorCount: number
}

export default function DesafiosPage() {
  const router = useRouter()
  const {
    startChallengeSession,
    setBackendSessionId,
    restoreSession,
    challengeMode,
    timeLimitSeconds,
    timeLimitPerQuestionSeconds,
  } = useGameStore()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recoverySession, setRecoverySession] = useState<PersistedSession | null>(null)
  const [checked, setChecked] = useState(false)
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([])
  const [loadingReview, setLoadingReview] = useState(false)

  // Load profile
  useEffect(() => {
    fetch("/api/perfil")
      .then((res) => res.json())
      .then((data: UserProfile) => setProfile(data))
      .catch(() => {})
  }, [])

  // Check for stored session on mount
  useEffect(() => {
    const stored = loadSession()
    if (stored && stored.challengeMode && stored.challengeMode !== "practice") {
      setRecoverySession(stored)
    }
    setChecked(true)
  }, [])

  // Load review questions when review mode is selected
  const loadReviewQuestions = useCallback(async () => {
    setLoadingReview(true)
    try {
      const res = await fetch("/api/questoes-erradas?limit=30")
      if (!res.ok) return
      const data = await res.json()
      const questions: Question[] = (data.questions as MissedQuestion[])
        .map((q) => {
          const op = REVERSE_OPERATION_MAP[q.operation]
          if (!op) return null
          // For subtraction: firstOperand = (x+y), secondOperand = x, answer = y
          // So we need to reconstruct x and y from firstOperand and secondOperand
          // For addition: firstOperand = x, secondOperand = y
          // The API stores (firstOperand, secondOperand, correctAnswer) as displayed
          // We can directly build from displayed values
          return buildQuestion(
            op,
            op === "subtraction" ? q.secondOperand : (op === "division" ? q.secondOperand : q.firstOperand),
            q.correctAnswer,
          )
        })
        .filter((q): q is Question => q !== null)
      setReviewQuestions(questions)
    } catch {
      // ignore
    } finally {
      setLoadingReview(false)
    }
  }, [])

  // Load review questions when mode changes to review
  useEffect(() => {
    if (challengeMode === "review") {
      loadReviewQuestions()
    }
  }, [challengeMode, loadReviewQuestions])

  const handleResume = () => {
    if (!recoverySession) return
    restoreSession(recoverySession)
    setRecoverySession(null)
    router.push("/desafios/sessao")
  }

  const handleDiscard = () => {
    clearSession()
    setRecoverySession(null)
  }

  const handleStart = async () => {
    const maxRetries = profile?.maxRetries ?? 5

    if (challengeMode === "review") {
      startChallengeSession(maxRetries, reviewQuestions)
    } else {
      startChallengeSession(maxRetries)
    }

    const state = useGameStore.getState()
    const ops = state.selectedOperations.map((op) => OPERATION_MAP[op])
    const nums = state.selectedNumbers
    const totalQuestions = state.gameState?.sessionTotal ?? 0

    // Create backend session
    try {
      const res = await fetch("/api/sessoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operations: challengeMode === "review"
            ? [...new Set(reviewQuestions.map((q) => OPERATION_MAP[q.operation]))]
            : ops,
          numbers: challengeMode === "review"
            ? [...new Set(reviewQuestions.map((q) => q._genX))]
            : nums,
          totalQuestions,
          mode: SESSION_MODE_API_MAP[challengeMode],
          timeLimitSeconds: timeLimitSeconds ?? undefined,
          timeLimitPerQuestionSeconds: timeLimitPerQuestionSeconds ?? undefined,
        }),
      })
      if (res.ok) {
        const session = await res.json()
        setBackendSessionId(session.id)
      }
    } catch {
      // Continue without backend session
    }

    router.push("/desafios/sessao")
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
    <div className="w-full max-w-lg mx-auto px-4 py-8 flex flex-col gap-8">
      <ChallengeSetup
        onStart={handleStart}
        reviewQuestionCount={reviewQuestions.length}
        loadingReview={loadingReview}
      />
      <ChallengeHistory />
    </div>
  )
}
