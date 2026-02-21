"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { Question, FeedbackType } from "@/types/game"

interface OperationCardProps {
  question: Question
  inputValue: string
  feedbackType: FeedbackType
  showingFeedback: boolean
  currentAttempt: number
  maxRetries: number
}

const operationColors: Record<string, { border: string; bg: string; text: string }> = {
  "+": { border: "border-green-400", bg: "bg-green-50", text: "text-green-600" },
  "−": { border: "border-blue-400", bg: "bg-blue-50", text: "text-blue-600" },
  "×": { border: "border-orange-400", bg: "bg-orange-50", text: "text-orange-600" },
  "÷": { border: "border-purple-400", bg: "bg-purple-50", text: "text-purple-600" },
}

const operationNames: Record<string, string> = {
  "+": "mais",
  "−": "menos",
  "×": "vezes",
  "÷": "dividido por",
}

export default function OperationCard({
  question,
  inputValue,
  feedbackType,
  showingFeedback,
  currentAttempt,
  maxRetries,
}: OperationCardProps) {
  const colors = operationColors[question.operationSymbol] || operationColors["+"]

  const showCorrectResult = showingFeedback && feedbackType === "correct"

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ x: 80, opacity: 0, scale: 0.92, rotate: 3 }}
        animate={
          showingFeedback && feedbackType === "incorrect"
            ? {
                x: [0, -10, 10, -10, 10, 0],
                opacity: 1,
                scale: 1,
                rotate: 0,
                transition: { x: { duration: 0.4 }, opacity: { duration: 0.2 }, scale: { duration: 0.2 } },
              }
            : showingFeedback && feedbackType === "correct"
              ? { x: 0, opacity: 1, scale: [1, 1.03, 1], rotate: 0 }
              : { x: 0, opacity: 1, scale: 1, rotate: 0 }
        }
        exit={{ x: -80, opacity: 0, scale: 0.92, rotate: -3 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`
          relative w-64 sm:w-72 md:w-80
          rounded-3xl border-4 ${colors.border} ${colors.bg}
          shadow-2xl p-6 sm:p-8
          flex flex-col items-center justify-between
          min-h-[320px] sm:min-h-[380px]
          ${showingFeedback && feedbackType === "correct" ? "ring-4 ring-green-400 ring-opacity-60" : ""}
          ${showingFeedback && feedbackType === "incorrect" ? "ring-4 ring-red-400 ring-opacity-60" : ""}
        `}
      >
        {/* Descrição para screen readers */}
        <span className="sr-only" aria-live="polite">
          Quanto é {question.displayFirst} {operationNames[question.operationSymbol] || question.operationSymbol} {question.displaySecond}?
          {showingFeedback && feedbackType === "correct" && ` Correto! A resposta é ${question.correctAnswer}.`}
          {showingFeedback && feedbackType === "incorrect" && ` Incorreto. Tente novamente.`}
        </span>

        {/* Tentativas restantes */}
        {currentAttempt > 1 && !showingFeedback && (
          <div className="absolute top-3 right-4 text-sm font-semibold text-gray-400">
            {currentAttempt}/{maxRetries}
          </div>
        )}

        {/* Primeiro número (topo) */}
        <div className="flex-1 flex items-center">
          <span className="font-display text-6xl sm:text-7xl md:text-8xl font-bold text-gray-800">
            {question.displayFirst}
          </span>
        </div>

        {/* Operação (centro-esquerda) */}
        <div className="flex-1 flex items-center justify-start w-full pl-4">
          <span className={`font-display text-5xl sm:text-6xl font-bold ${colors.text}`}>
            {question.operationSymbol}
          </span>
        </div>

        {/* Segundo número (base) */}
        <div className="flex-1 flex items-center">
          <span className="font-display text-6xl sm:text-7xl md:text-8xl font-bold text-gray-800">
            {question.displaySecond}
          </span>
        </div>

        {/* Linha do resultado */}
        <div className="w-full border-t-2 border-gray-300 pt-4 mt-2 flex items-center justify-center gap-2">
          <span className="font-display text-3xl sm:text-4xl text-gray-500">=</span>
          {showCorrectResult ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="font-display text-5xl sm:text-6xl font-bold text-green-600"
            >
              {question.correctAnswer}
            </motion.span>
          ) : showingFeedback && feedbackType === "incorrect" ? (
            <span className="font-display text-3xl sm:text-4xl font-bold text-red-500">
              {inputValue || "?"}
            </span>
          ) : (
            <span className="font-display text-4xl sm:text-5xl font-bold text-gray-700 min-w-[60px] text-center">
              {inputValue || (
                <span className="text-gray-300 animate-pulse">?</span>
              )}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
