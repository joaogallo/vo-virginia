"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { AvatarState } from "@/types/game"

interface AvatarProps {
  state: AvatarState
}

const avatarEmojis: Record<AvatarState, string> = {
  idle: "🦉",
  thinking: "🤔",
  correct: "🎉",
  incorrect: "💪",
}

const avatarMessages: Record<AvatarState, string> = {
  idle: "Qual é a resposta?",
  thinking: "Hmm...",
  correct: "Muito bem!",
  incorrect: "Tente de novo!",
}

const avatarAnimations: Record<AvatarState, object> = {
  idle: {
    y: [0, -5, 0],
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
  },
  thinking: {
    rotate: [-3, 3, -3],
    transition: { repeat: Infinity, duration: 1, ease: "easeInOut" },
  },
  correct: {
    scale: [1, 1.2, 1],
    rotate: [0, -10, 10, 0],
    transition: { duration: 0.6 },
  },
  incorrect: {
    x: [0, -5, 5, -5, 0],
    transition: { duration: 0.4 },
  },
}

export default function Avatar({ state }: AvatarProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            ...avatarAnimations[state],
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="text-6xl sm:text-7xl select-none"
        >
          {avatarEmojis[state]}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.p
          key={state + "-msg"}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="font-display text-lg sm:text-xl font-bold text-gray-600 text-center"
        >
          {avatarMessages[state]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
