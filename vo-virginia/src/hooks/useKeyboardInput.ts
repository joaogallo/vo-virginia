"use client"

import { useEffect } from "react"

interface KeyboardInputHandlers {
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onConfirm: () => void
  enabled: boolean
}

export function useKeyboardInput({
  onDigit,
  onBackspace,
  onClear,
  onConfirm,
  enabled,
}: KeyboardInputHandlers) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault()
        onDigit(e.key)
      } else if (e.key === "Backspace") {
        e.preventDefault()
        onBackspace()
      } else if (e.key === "Delete" || e.key === "Escape") {
        e.preventDefault()
        onClear()
      } else if (e.key === "Enter") {
        e.preventDefault()
        onConfirm()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled, onDigit, onBackspace, onClear, onConfirm])
}
