"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { AvatarState } from "@/types/game"
import LottieAnimation from "./LottieAnimation"

interface AvatarProps {
  state: AvatarState
}

const avatarMessages: Record<AvatarState, string> = {
  idle: "Qual é a resposta?",
  thinking: "Hmm...",
  correct: "Muito bem!",
  incorrect: "Tente de novo!",
}

const avatarAnimations: Record<AvatarState, { src: string; loop: boolean }> = {
  idle: { src: "/animations/idle.json", loop: true },
  thinking: { src: "/animations/thinking.json", loop: true },
  correct: { src: "/animations/correct.json", loop: false },
  incorrect: { src: "/animations/incorrect.json", loop: false },
}

export default function Avatar({ state }: AvatarProps) {
  const anim = avatarAnimations[state]

  return (
    <div className="flex flex-col items-center gap-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="w-20 h-20"
        >
          <LottieAnimation
            src={anim.src}
            loop={anim.loop}
            className="w-full h-full"
          />
        </motion.div>
      </AnimatePresence>
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
    </div>
  )
}
