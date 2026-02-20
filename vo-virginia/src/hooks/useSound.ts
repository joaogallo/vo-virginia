"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const STORAGE_KEY = "vo-virginia-muted"

function loadAudio(src: string): HTMLAudioElement {
  const audio = new Audio(src)
  audio.preload = "auto"
  return audio
}

export function useSound() {
  const [isMuted, setIsMuted] = useState(false)
  const correctRef = useRef<HTMLAudioElement | null>(null)
  const incorrectRef = useRef<HTMLAudioElement | null>(null)
  const completeRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setIsMuted(localStorage.getItem(STORAGE_KEY) === "true")
    correctRef.current = loadAudio("/sounds/correct.mp3")
    incorrectRef.current = loadAudio("/sounds/incorrect.mp3")
    completeRef.current = loadAudio("/sounds/complete.mp3")
  }, [])

  const play = useCallback(
    (ref: React.RefObject<HTMLAudioElement | null>) => {
      if (isMuted || !ref.current) return
      ref.current.currentTime = 0
      ref.current.play().catch(() => {})
    },
    [isMuted],
  )

  const playCorrect = useCallback(() => play(correctRef), [play])
  const playIncorrect = useCallback(() => play(incorrectRef), [play])
  const playComplete = useCallback(() => play(completeRef), [play])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  return { playCorrect, playIncorrect, playComplete, isMuted, toggleMute }
}
