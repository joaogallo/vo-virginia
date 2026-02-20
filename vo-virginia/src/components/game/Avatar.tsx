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

const avatarAnimations: Record<AvatarState, { src: string; loop: boolean }> = {
  idle: { src: "/animations/idle.json", loop: true },
  thinking: { src: "/animations/thinking.json", loop: true },
  correct: { src: "/animations/correct.json", loop: false },
  incorrect: { src: "/animations/incorrect.json", loop: false },
}

const isFeedback = (state: AvatarState) => state === "correct" || state === "incorrect"

export default function Avatar({ state }: AvatarProps) {
  const anim = avatarAnimations[state]
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
          className={feedback ? "w-28 h-28 sm:w-32 sm:h-32" : "w-16 h-16"}
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
