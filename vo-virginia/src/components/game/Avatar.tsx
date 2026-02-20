"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { AvatarState } from "@/types/game"
import LottieAnimation from "./LottieAnimation"

interface AvatarProps {
  state: AvatarState
}

const avatarMessages: Record<AvatarState, { text: string; color: string }> = {
  idle: { text: "Qual é a resposta?", color: "text-gray-600" },
  thinking: { text: "Hmm...", color: "text-gray-600" },
  correct: { text: "Muito bem!", color: "text-green-600" },
  incorrect: { text: "Tente de novo!", color: "text-red-500" },
}

function CorrectIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <motion.circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="#22c55e"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <motion.path
        d="M30 52 L44 66 L72 36"
        fill="none"
        stroke="#22c55e"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
      />
    </svg>
  )
}

function IncorrectIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <motion.circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="#ef4444"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <motion.path
        d="M35 35 L65 65"
        fill="none"
        stroke="#ef4444"
        strokeWidth="7"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, delay: 0.25, ease: "easeOut" }}
      />
      <motion.path
        d="M65 35 L35 65"
        fill="none"
        stroke="#ef4444"
        strokeWidth="7"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, delay: 0.4, ease: "easeOut" }}
      />
    </svg>
  )
}

const isFeedback = (state: AvatarState) => state === "correct" || state === "incorrect"

export default function Avatar({ state }: AvatarProps) {
  const msg = avatarMessages[state]
  const feedback = isFeedback(state)

  return (
    <div className="flex flex-col items-center gap-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={feedback ? { opacity: 0, scale: 0 } : { opacity: 0, scale: 0.8 }}
          animate={feedback ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={feedback
            ? { type: "spring", stiffness: 400, damping: 15 }
            : { duration: 0.2 }
          }
          className={feedback ? "w-24 h-24 sm:w-28 sm:h-28" : "w-16 h-16"}
        >
          {state === "correct" ? (
            <CorrectIcon />
          ) : state === "incorrect" ? (
            <IncorrectIcon />
          ) : (
            <LottieAnimation
              src={state === "thinking" ? "/animations/thinking.json" : "/animations/idle.json"}
              loop
              className="w-full h-full"
            />
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className={`font-display font-bold text-center ${msg.color} ${
            feedback ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
          }`}
        >
          {msg.text}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
