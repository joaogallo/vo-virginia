import { describe, it, expect, beforeEach } from "vitest"
import {
  saveSession,
  loadSession,
  clearSession,
  hasStoredSession,
} from "@/lib/session-storage"
import type { PersistedSession } from "@/lib/session-storage"

function makeSession(overrides: Partial<PersistedSession> = {}): PersistedSession {
  return {
    version: "1",
    savedAt: new Date().toISOString(),
    backendSessionId: null,
    syncedAnswerCount: 0,
    selectedOperations: ["addition"],
    selectedNumbers: [3],
    maxRetries: 5,
    questionLimit: null,
    queue: [],
    currentQuestion: null,
    currentAttempt: 1,
    correctCount: 0,
    wrongCount: 0,
    sessionTotal: 11,
    sessionStartTime: Date.now(),
    questionStartTime: Date.now(),
    answerHistory: [],
    ...overrides,
  }
}

describe("session-storage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("saveSession + loadSession roundtrip", () => {
    const session = makeSession()
    saveSession(session)
    const loaded = loadSession()
    expect(loaded).not.toBeNull()
    expect(loaded!.selectedOperations).toEqual(["addition"])
    expect(loaded!.selectedNumbers).toEqual([3])
    expect(loaded!.sessionTotal).toBe(11)
  })

  it("loadSession retorna null quando vazio", () => {
    expect(loadSession()).toBeNull()
  })

  it("loadSession retorna null se versão diferente", () => {
    const session = makeSession({ version: "999" })
    // Salvar diretamente com versão errada
    localStorage.setItem("vo-virginia-session", JSON.stringify(session))
    expect(loadSession()).toBeNull()
  })

  it("loadSession retorna null se expirado (>24h)", () => {
    const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    const session = makeSession({ savedAt: oldDate })
    localStorage.setItem("vo-virginia-session", JSON.stringify({ ...session, version: "1" }))
    expect(loadSession()).toBeNull()
  })

  it("clearSession remove do storage", () => {
    saveSession(makeSession())
    expect(hasStoredSession()).toBe(true)
    clearSession()
    expect(hasStoredSession()).toBe(false)
  })

  it("hasStoredSession retorna false quando vazio", () => {
    expect(hasStoredSession()).toBe(false)
  })

  it("hasStoredSession retorna true após save", () => {
    saveSession(makeSession())
    expect(hasStoredSession()).toBe(true)
  })
})
