"use client"

import { useEffect, useState } from "react"
import Lottie from "lottie-react"

interface LottieAnimationProps {
  src: string
  loop?: boolean
  autoplay?: boolean
  className?: string
  onComplete?: () => void
}

export default function LottieAnimation({
  src,
  loop = false,
  autoplay = true,
  className,
  onComplete,
}: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState<object | null>(null)

  useEffect(() => {
    fetch(src)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => {})
  }, [src])

  if (!animationData) return null

  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      onComplete={onComplete}
    />
  )
}
