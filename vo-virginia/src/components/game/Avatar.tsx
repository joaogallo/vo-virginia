"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { AvatarState } from "@/types/game"

interface AvatarProps {
  state: AvatarState
}

const avatarMessages: Record<AvatarState, string> = {
  idle: "Qual é a resposta?",
  thinking: "Hmm...",
  correct: "Muito bem!",
  incorrect: "Tente de novo!",
}

export default function Avatar({ state }: AvatarProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={state}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className="font-display text-lg sm:text-xl font-bold text-gray-600 text-center"
      >
        {avatarMessages[state]}
      </motion.p>
    </AnimatePresence>
  )
}
