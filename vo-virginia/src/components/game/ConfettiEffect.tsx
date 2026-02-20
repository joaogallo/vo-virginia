"use client"

import LottieAnimation from "./LottieAnimation"

interface ConfettiEffectProps {
  isActive: boolean
}

export default function ConfettiEffect({ isActive }: ConfettiEffectProps) {
  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <LottieAnimation
        src="/animations/confetti.json"
        loop={false}
        className="w-full h-full"
      />
    </div>
  )
}
