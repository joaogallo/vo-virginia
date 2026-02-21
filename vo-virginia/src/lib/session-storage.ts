import type { Operation, Question, SessionMode, AnswerRecord } from "@/types/game"

const SESSION_KEY = "vo-virginia-session"
const VERSION = "2"
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24h

export interface PersistedSession {
  version: string
  savedAt: string
  backendSessionId: string | null
  syncedAnswerCount: number

  // Setup
  selectedOperations: Operation[]
  selectedNumbers: number[]
  maxRetries: number
  questionLimit: number | null

  // GameState
  queue: Question[]
  currentQuestion: Question | null
  currentAttempt: number
  correctCount: number
  wrongCount: number
  sessionTotal: number
  sessionStartTime: number
  questionStartTime: number

  // Challenge mode
  challengeMode: SessionMode | null
  mode: SessionMode | null
  timeLimitSeconds: number | null
  timeLimitPerQuestionSeconds: number | null
  isInterrupted: boolean
  interruptedReason: string | null

  // Histórico
  answerHistory: AnswerRecord[]
}

export function saveSession(data: PersistedSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...data, version: VERSION, savedAt: new Date().toISOString() }))
  } catch {
    // localStorage indisponível (modo privado Safari, quota excedida)
  }
}

export function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const data: PersistedSession = JSON.parse(raw)
    if (data.version !== VERSION) {
      clearSession()
      return null
    }

    const age = Date.now() - new Date(data.savedAt).getTime()
    if (age > MAX_AGE_MS) {
      clearSession()
      return null
    }

    return data
  } catch {
    clearSession()
    return null
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}

export function hasStoredSession(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) !== null
  } catch {
    return false
  }
}
