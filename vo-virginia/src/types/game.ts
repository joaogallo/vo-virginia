export type Operation = "addition" | "subtraction" | "multiplication" | "division"

export type SessionMode = "practice" | "timed_total" | "timed_per_question" | "marathon" | "review"

export interface Question {
  id: string
  operation: Operation
  displayFirst: number
  displaySecond: number
  operationSymbol: string
  correctAnswer: number
  _genX: number
  _genY: number
}

export interface GameState {
  queue: Question[]
  currentQuestion: Question | null
  correctCount: number
  wrongCount: number
  currentAttempt: number
  maxRetries: number
  sessionStartTime: number
  questionStartTime: number
  isComplete: boolean
  sessionTotal: number
  mode: SessionMode
  timeLimitSeconds: number | null
  timeLimitPerQuestionSeconds: number | null
  marathonBatchSize: number
}

export interface AnswerRecord {
  questionId: string
  operation: Operation
  displayFirst: number
  displaySecond: number
  correctAnswer: number
  userAnswer: number
  isCorrect: boolean
  attemptNumber: number
  timeSpentMs: number
  answeredAt: string
}

export type AvatarState = "idle" | "thinking" | "correct" | "incorrect"

export type FeedbackType = "correct" | "incorrect" | null

export const OPERATION_LABELS: Record<Operation, string> = {
  addition: "Adição",
  subtraction: "Subtração",
  multiplication: "Multiplicação",
  division: "Divisão",
}

export const OPERATION_SYMBOLS: Record<Operation, string> = {
  addition: "+",
  subtraction: "−",
  multiplication: "×",
  division: "÷",
}

export const OPERATION_COLORS: Record<Operation, string> = {
  addition: "bg-green-500",
  subtraction: "bg-blue-500",
  multiplication: "bg-orange-500",
  division: "bg-purple-500",
}

export const SESSION_MODE_LABELS: Record<SessionMode, string> = {
  practice: "Prática",
  timed_total: "Contra o Tempo (Total)",
  timed_per_question: "Contra o Tempo (Por Questão)",
  marathon: "Maratona",
  review: "Revisão",
}

export const SESSION_MODE_ICONS: Record<SessionMode, string> = {
  practice: "📝",
  timed_total: "⏱️",
  timed_per_question: "⏰",
  marathon: "🏃",
  review: "🔄",
}
