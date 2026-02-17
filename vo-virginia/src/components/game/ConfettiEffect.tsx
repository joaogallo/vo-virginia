"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface ConfettiEffectProps {
  isActive: boolean
}

const CONFETTI_COLORS = [
  "#22c55e", "#3b82f6", "#f97316", "#a855f7",
  "#eab308", "#ec4899", "#14b8a6", "#f43f5e",
]

export default function ConfettiEffect({ isActive }: ConfettiEffectProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
      })),
    []
  )

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: `${p.x}vw`,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: "110vh",
            rotate: p.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: p.delay,
            ease: "easeIn",
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  )
}
