"use client"

import { motion } from "framer-motion"

interface VirtualKeypadProps {
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onConfirm: () => void
  disabled: boolean
}

function KeypadButton({
  label,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
}: {
  label: string
  onClick: () => void
  variant?: "default" | "action" | "confirm" | "danger"
  className?: string
  disabled?: boolean
}) {
  const variants = {
    default: "bg-white hover:bg-gray-50 text-gray-800 border-gray-200 shadow-md",
    action: "bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-300 shadow-md",
    confirm: "bg-green-500 hover:bg-green-600 text-white border-green-600 shadow-lg",
    danger: "bg-red-100 hover:bg-red-200 text-red-600 border-red-300 shadow-md",
  }

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={() => {
        if (!disabled) {
          // Haptic feedback on mobile
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(30)
          }
          onClick()
        }
      }}
      disabled={disabled}
      className={`
        font-display text-2xl sm:text-3xl font-bold
        rounded-2xl border-2
        min-h-[64px] min-w-[64px]
        flex items-center justify-center
        transition-colors duration-150
        select-none cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {label}
    </motion.button>
  )
}

export default function VirtualKeypad({
  onDigit,
  onBackspace,
  onClear,
  onConfirm,
  disabled,
}: VirtualKeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-xs mx-auto">
      {/* Linha 1: 1 2 3 ⌫ */}
      <KeypadButton label="1" onClick={() => onDigit("1")} disabled={disabled} />
      <KeypadButton label="2" onClick={() => onDigit("2")} disabled={disabled} />
      <KeypadButton label="3" onClick={() => onDigit("3")} disabled={disabled} />
      <KeypadButton
        label="⌫"
        onClick={onBackspace}
        variant="action"
        disabled={disabled}
      />

      {/* Linha 2: 4 5 6 (vazio) */}
      <KeypadButton label="4" onClick={() => onDigit("4")} disabled={disabled} />
      <KeypadButton label="5" onClick={() => onDigit("5")} disabled={disabled} />
      <KeypadButton label="6" onClick={() => onDigit("6")} disabled={disabled} />
      <div /> {/* espaço vazio */}

      {/* Linha 3: 7 8 9 OK */}
      <KeypadButton label="7" onClick={() => onDigit("7")} disabled={disabled} />
      <KeypadButton label="8" onClick={() => onDigit("8")} disabled={disabled} />
      <KeypadButton label="9" onClick={() => onDigit("9")} disabled={disabled} />
      <KeypadButton
        label="OK"
        onClick={onConfirm}
        variant="confirm"
        className="row-span-2"
        disabled={disabled}
      />

      {/* Linha 4: C 0 */}
      <KeypadButton
        label="C"
        onClick={onClear}
        variant="danger"
        disabled={disabled}
      />
      <KeypadButton
        label="0"
        onClick={() => onDigit("0")}
        className="col-span-2"
        disabled={disabled}
      />
    </div>
  )
}
