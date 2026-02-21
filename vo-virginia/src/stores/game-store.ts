import { create } from "zustand"
import type {
  Operation,
  Question,
  GameState,
  SessionMode,
  AnswerRecord,
  FeedbackType,
  AvatarState,
} from "@/types/game"
import {
  createGameState,
  createReviewGameState,
  replenishMarathonQueue,
  nextQuestion,
  submitAnswer,
} from "@/lib/game-engine"
import type { PersistedSession } from "@/lib/session-storage"

interface GameStore {
  // Setup
  selectedOperations: Operation[]
  selectedNumbers: number[]
  questionLimit: number | null

  // Game state
  gameState: GameState | null
  answerHistory: AnswerRecord[]
  inputValue: string
  showingFeedback: boolean
  feedbackType: FeedbackType
  avatarState: AvatarState
  lastCorrectAnswer: number | null
  needsAdvance: boolean

  // Challenge mode
  challengeMode: SessionMode
  timeLimitSeconds: number | null
  timeLimitPerQuestionSeconds: number | null
  isInterrupted: boolean
  interruptedReason: string | null

  // Persistence
  backendSessionId: string | null
  syncedAnswerCount: number

  // Setup actions
  toggleOperation: (op: Operation) => void
  toggleNumber: (num: number) => void
  setQuestionLimit: (limit: number | null) => void
  resetSetup: () => void

  // Game actions
  startSession: (maxRetries: number) => void
  appendDigit: (digit: string) => void
  deleteDigit: () => void
  clearInput: () => void
  confirmAnswer: () => { wasCorrect: boolean; correctAnswer: number; exhaustedRetries: boolean } | null
  advanceToNext: () => void
  endSession: () => void

  // Challenge actions
  setChallengeMode: (mode: SessionMode) => void
  setTimeLimits: (total: number | null, perQuestion: number | null) => void
  startChallengeSession: (maxRetries: number, reviewQuestions?: Question[]) => void
  interruptSession: (reason: string) => void
  endMarathon: () => void
  resetChallengeSetup: () => void

  // Persistence actions
  setBackendSessionId: (id: string) => void
  setSyncedAnswerCount: (count: number) => void
  restoreSession: (persisted: PersistedSession) => void

  // Computed helpers
  totalQuestions: () => number
  questionsAnswered: () => number
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Setup
  selectedOperations: [],
  selectedNumbers: [],
  questionLimit: null,

  // Game state
  gameState: null,
  answerHistory: [],
  inputValue: "",
  showingFeedback: false,
  feedbackType: null,
  avatarState: "idle",
  lastCorrectAnswer: null,
  needsAdvance: false,

  // Challenge mode
  challengeMode: "practice",
  timeLimitSeconds: null,
  timeLimitPerQuestionSeconds: null,
  isInterrupted: false,
  interruptedReason: null,

  // Persistence
  backendSessionId: null,
  syncedAnswerCount: 0,

  // Setup actions
  toggleOperation: (op) =>
    set((state) => {
      const ops = state.selectedOperations
      if (ops.includes(op)) {
        return { selectedOperations: ops.filter((o) => o !== op) }
      }
      return { selectedOperations: [...ops, op] }
    }),

  toggleNumber: (num) =>
    set((state) => {
      const nums = state.selectedNumbers
      if (nums.includes(num)) {
        return { selectedNumbers: nums.filter((n) => n !== num) }
      }
      return { selectedNumbers: [...nums, num] }
    }),

  setQuestionLimit: (limit) => set({ questionLimit: limit }),

  resetSetup: () =>
    set({
      selectedOperations: [],
      selectedNumbers: [],
      questionLimit: null,
      gameState: null,
      answerHistory: [],
      inputValue: "",
      showingFeedback: false,
      feedbackType: null,
      avatarState: "idle",
      lastCorrectAnswer: null,
      needsAdvance: false,
      backendSessionId: null,
      syncedAnswerCount: 0,
      challengeMode: "practice",
      timeLimitSeconds: null,
      timeLimitPerQuestionSeconds: null,
      isInterrupted: false,
      interruptedReason: null,
    }),

  // Game actions
  startSession: (maxRetries) => {
    const { selectedOperations, selectedNumbers, questionLimit } = get()
    const state = createGameState(selectedOperations, selectedNumbers, maxRetries, questionLimit ?? undefined)
    const withQuestion = nextQuestion(state)
    set({
      gameState: withQuestion,
      answerHistory: [],
      inputValue: "",
      showingFeedback: false,
      feedbackType: null,
      avatarState: "idle",
      lastCorrectAnswer: null,
      needsAdvance: false,
      backendSessionId: null,
      syncedAnswerCount: 0,
      challengeMode: "practice",
      isInterrupted: false,
      interruptedReason: null,
    })
  },

  appendDigit: (digit) =>
    set((state) => {
      if (state.showingFeedback) return {}
      if (state.inputValue.length >= 4) return {} // máximo 4 dígitos
      const newValue = state.inputValue + digit
      return { inputValue: newValue, avatarState: "thinking" }
    }),

  deleteDigit: () =>
    set((state) => {
      if (state.showingFeedback) return {}
      const newValue = state.inputValue.slice(0, -1)
      return {
        inputValue: newValue,
        avatarState: newValue.length > 0 ? "thinking" : "idle",
      }
    }),

  clearInput: () =>
    set((state) => {
      if (state.showingFeedback) return {}
      return { inputValue: "", avatarState: "idle" }
    }),

  confirmAnswer: () => {
    const { gameState, inputValue, showingFeedback } = get()
    if (!gameState || !gameState.currentQuestion || showingFeedback) return null
    if (inputValue === "") return null

    const userAnswer = parseInt(inputValue, 10)
    if (isNaN(userAnswer)) return null

    const timeSpentMs = Date.now() - gameState.questionStartTime
    const result = submitAnswer(gameState, userAnswer)

    const record: AnswerRecord = {
      questionId: gameState.currentQuestion.id,
      operation: gameState.currentQuestion.operation,
      displayFirst: gameState.currentQuestion.displayFirst,
      displaySecond: gameState.currentQuestion.displaySecond,
      correctAnswer: gameState.currentQuestion.correctAnswer,
      userAnswer,
      isCorrect: result.wasCorrect,
      attemptNumber: gameState.currentAttempt,
      timeSpentMs,
      answeredAt: new Date().toISOString(),
    }

    // Preservar currentQuestion durante o feedback para que o card continue visível.
    // submitAnswer seta currentQuestion=null quando acerta ou esgota tentativas,
    // mas o GameContainer precisa da questão para renderizar o card com o feedback.
    const shouldAdvance = result.wasCorrect || result.exhaustedRetries
    set({
      gameState: {
        ...result.newState,
        currentQuestion: shouldAdvance ? gameState.currentQuestion : result.newState.currentQuestion,
      },
      needsAdvance: shouldAdvance,
      answerHistory: [...get().answerHistory, record],
      inputValue: "",
      showingFeedback: true,
      feedbackType: result.wasCorrect ? "correct" : "incorrect",
      avatarState: result.wasCorrect ? "correct" : "incorrect",
      lastCorrectAnswer: result.correctAnswer,
    })

    return {
      wasCorrect: result.wasCorrect,
      correctAnswer: result.correctAnswer,
      exhaustedRetries: result.exhaustedRetries,
    }
  },

  advanceToNext: () => {
    const { gameState, needsAdvance, selectedOperations, selectedNumbers } = get()
    if (!gameState) return

    if (needsAdvance) {
      // Acertou ou esgotou tentativas: avançar para próxima questão
      const stateForNext = { ...gameState, currentQuestion: null }
      let newState = nextQuestion(stateForNext)

      // Marathon: replenish queue when it's empty instead of completing
      if (newState.isComplete && gameState.mode === "marathon") {
        const replenished = replenishMarathonQueue(stateForNext, selectedOperations, selectedNumbers)
        newState = nextQuestion(replenished)
      }

      set({
        gameState: newState,
        needsAdvance: false,
        inputValue: "",
        showingFeedback: false,
        feedbackType: null,
        avatarState: "idle",
        lastCorrectAnswer: null,
      })
    } else {
      // Retentativa na mesma questão (erro sem esgotar tentativas)
      set({
        needsAdvance: false,
        inputValue: "",
        showingFeedback: false,
        feedbackType: null,
        avatarState: "idle",
        lastCorrectAnswer: null,
      })
    }
  },

  // Challenge actions
  setChallengeMode: (mode) => set({ challengeMode: mode }),

  setTimeLimits: (total, perQuestion) =>
    set({ timeLimitSeconds: total, timeLimitPerQuestionSeconds: perQuestion }),

  startChallengeSession: (maxRetries, reviewQuestions?) => {
    const { selectedOperations, selectedNumbers, questionLimit, challengeMode, timeLimitSeconds, timeLimitPerQuestionSeconds } = get()

    let state: GameState

    if (challengeMode === "review" && reviewQuestions && reviewQuestions.length > 0) {
      state = createReviewGameState(reviewQuestions, maxRetries)
    } else {
      state = createGameState(
        selectedOperations,
        selectedNumbers,
        maxRetries,
        challengeMode === "marathon" ? undefined : (questionLimit ?? undefined),
        challengeMode,
        timeLimitSeconds,
        timeLimitPerQuestionSeconds,
      )
    }

    const withQuestion = nextQuestion(state)
    set({
      gameState: withQuestion,
      answerHistory: [],
      inputValue: "",
      showingFeedback: false,
      feedbackType: null,
      avatarState: "idle",
      lastCorrectAnswer: null,
      needsAdvance: false,
      backendSessionId: null,
      syncedAnswerCount: 0,
      isInterrupted: false,
      interruptedReason: null,
    })
  },

  interruptSession: (reason) => {
    const { gameState } = get()
    if (!gameState) return
    set({
      gameState: { ...gameState, isComplete: true },
      isInterrupted: true,
      interruptedReason: reason,
      showingFeedback: false,
      feedbackType: null,
    })
  },

  endMarathon: () => {
    const { gameState, answerHistory } = get()
    if (!gameState) return
    const totalAnswered = new Set(
      answerHistory.filter((a) => a.isCorrect).map((a) => a.questionId)
    ).size + gameState.wrongCount
    set({
      gameState: {
        ...gameState,
        isComplete: true,
        sessionTotal: totalAnswered,
      },
      showingFeedback: false,
      feedbackType: null,
    })
  },

  resetChallengeSetup: () =>
    set({
      selectedOperations: [],
      selectedNumbers: [],
      questionLimit: null,
      gameState: null,
      answerHistory: [],
      inputValue: "",
      showingFeedback: false,
      feedbackType: null,
      avatarState: "idle",
      lastCorrectAnswer: null,
      needsAdvance: false,
      backendSessionId: null,
      syncedAnswerCount: 0,
      challengeMode: "practice",
      timeLimitSeconds: null,
      timeLimitPerQuestionSeconds: null,
      isInterrupted: false,
      interruptedReason: null,
    }),

  // Persistence actions
  setBackendSessionId: (id) => set({ backendSessionId: id }),
  setSyncedAnswerCount: (count) => set({ syncedAnswerCount: count }),

  restoreSession: (persisted) =>
    set({
      selectedOperations: persisted.selectedOperations,
      selectedNumbers: persisted.selectedNumbers,
      questionLimit: persisted.questionLimit,
      backendSessionId: persisted.backendSessionId,
      syncedAnswerCount: persisted.syncedAnswerCount,
      answerHistory: persisted.answerHistory,
      challengeMode: persisted.challengeMode ?? "practice",
      timeLimitSeconds: persisted.timeLimitSeconds ?? null,
      timeLimitPerQuestionSeconds: persisted.timeLimitPerQuestionSeconds ?? null,
      isInterrupted: persisted.isInterrupted ?? false,
      interruptedReason: persisted.interruptedReason ?? null,
      gameState: {
        queue: persisted.queue,
        currentQuestion: persisted.currentQuestion,
        currentAttempt: persisted.currentAttempt,
        correctCount: persisted.correctCount,
        wrongCount: persisted.wrongCount,
        maxRetries: persisted.maxRetries,
        sessionStartTime: persisted.sessionStartTime,
        questionStartTime: Date.now(),
        isComplete: false,
        sessionTotal: persisted.sessionTotal,
        mode: persisted.mode ?? "practice",
        timeLimitSeconds: persisted.timeLimitSeconds ?? null,
        timeLimitPerQuestionSeconds: persisted.timeLimitPerQuestionSeconds ?? null,
        marathonBatchSize: persisted.mode === "marathon" ? 20 : 0,
      },
      inputValue: "",
      showingFeedback: false,
      feedbackType: null,
      avatarState: "idle",
      lastCorrectAnswer: null,
      needsAdvance: false,
    }),

  endSession: () =>
    set({
      gameState: null,
      inputValue: "",
      showingFeedback: false,
      feedbackType: null,
      avatarState: "idle",
      backendSessionId: null,
      syncedAnswerCount: 0,
    }),

  totalQuestions: () => {
    const { selectedOperations, selectedNumbers } = get()
    let total = 0
    for (const op of selectedOperations) {
      for (const x of selectedNumbers) {
        for (let y = 0; y <= 10; y++) {
          if (op === "division" && x === 0) continue
          total++
        }
      }
    }
    return total
  },

  questionsAnswered: () => {
    const { answerHistory } = get()
    // Contar respostas corretas únicas (por questionId)
    const correctIds = new Set(
      answerHistory.filter((a) => a.isCorrect).map((a) => a.questionId)
    )
    return correctIds.size
  },
}))
