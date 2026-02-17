export type Operation = "addition" | "subtraction" | "multiplication" | "division"

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
