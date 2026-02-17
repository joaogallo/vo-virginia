import type { Operation } from "@/types/game"

export const OPERATIONS: {
  value: Operation
  label: string
  symbol: string
  color: string
  colorLight: string
  borderColor: string
}[] = [
  {
    value: "addition",
    label: "Adição",
    symbol: "+",
    color: "bg-green-500",
    colorLight: "bg-green-100",
    borderColor: "border-green-500",
  },
  {
    value: "subtraction",
    label: "Subtração",
    symbol: "−",
    color: "bg-blue-500",
    colorLight: "bg-blue-100",
    borderColor: "border-blue-500",
  },
  {
    value: "multiplication",
    label: "Multiplicação",
    symbol: "×",
    color: "bg-orange-500",
    colorLight: "bg-orange-100",
    borderColor: "border-orange-500",
  },
  {
    value: "division",
    label: "Divisão",
    symbol: "÷",
    color: "bg-purple-500",
    colorLight: "bg-purple-100",
    borderColor: "border-purple-500",
  },
]

export const AVAILABLE_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
