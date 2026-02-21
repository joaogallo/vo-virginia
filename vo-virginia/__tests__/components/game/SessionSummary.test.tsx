import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SessionSummary from "@/components/game/SessionSummary"
import { useGameStore } from "@/stores/game-store"
import type { AnswerRecord, GameState } from "@/types/game"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: (props: Record<string, unknown>) => {
      const { children, className } = props
      return <div className={className as string}>{children as React.ReactNode}</div>
    },
    h1: (props: Record<string, unknown>) => {
      const { children, className } = props
      return <h1 className={className as string}>{children as React.ReactNode}</h1>
    },
    p: (props: Record<string, unknown>) => {
      const { children, className } = props
      return <p className={className as string}>{children as React.ReactNode}</p>
    },
    button: (props: Record<string, unknown>) => {
      const { children, onClick, className } = props
      return (
        <button onClick={onClick as React.MouseEventHandler<HTMLButtonElement>} className={className as string}>
          {children as React.ReactNode}
        </button>
      )
    },
  },
}))

// Mock hooks and components
vi.mock("@/hooks/useSound", () => ({
  useSound: () => ({
    playComplete: vi.fn(),
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
    isMuted: false,
    toggleMute: vi.fn(),
  }),
}))

vi.mock("@/components/game/ConfettiEffect", () => ({
  default: () => null,
}))

vi.mock("@/components/game/LottieAnimation", () => ({
  default: () => <div data-testid="lottie" />,
}))

describe("SessionSummary", () => {
  const onPlayAgain = vi.fn()
  const onGoHome = vi.fn()

  beforeEach(() => {
    onPlayAgain.mockClear()
    onGoHome.mockClear()

    const gameState: GameState = {
      queue: [],
      currentQuestion: null,
      correctCount: 8,
      wrongCount: 2,
      currentAttempt: 1,
      maxRetries: 5,
      sessionStartTime: Date.now() - 90_000,
      questionStartTime: Date.now(),
      isComplete: true,
      sessionTotal: 10,
    }

    const answerHistory: AnswerRecord[] = [
      ...Array.from({ length: 8 }, (_, i) => ({
        questionId: `q-${i}`,
        operation: "addition" as const,
        displayFirst: i,
        displaySecond: 1,
        correctAnswer: i + 1,
        userAnswer: i + 1,
        isCorrect: true,
        attemptNumber: 1,
        timeSpentMs: 3000,
        answeredAt: new Date().toISOString(),
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        questionId: `q-wrong-${i}`,
        operation: "addition" as const,
        displayFirst: i,
        displaySecond: 1,
        correctAnswer: i + 1,
        userAnswer: 999,
        isCorrect: false,
        attemptNumber: 1,
        timeSpentMs: 5000,
        answeredAt: new Date().toISOString(),
      })),
    ]

    useGameStore.setState({ gameState, answerHistory })
  })

  it("renderiza título Parabéns!", () => {
    render(<SessionSummary onPlayAgain={onPlayAgain} onGoHome={onGoHome} />)
    expect(screen.getByText("Parabéns!")).toBeInTheDocument()
  })

  it("mostra acertos", () => {
    render(<SessionSummary onPlayAgain={onPlayAgain} onGoHome={onGoHome} />)
    // "8" appears as acertos count
    expect(screen.getByText("8")).toBeInTheDocument()
  })

  it("mostra erros", () => {
    render(<SessionSummary onPlayAgain={onPlayAgain} onGoHome={onGoHome} />)
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("mostra precisão", () => {
    render(<SessionSummary onPlayAgain={onPlayAgain} onGoHome={onGoHome} />)
    expect(screen.getByText("80%")).toBeInTheDocument()
  })

  it("botão Jogar de novo chama callback", async () => {
    const user = userEvent.setup()
    render(<SessionSummary onPlayAgain={onPlayAgain} onGoHome={onGoHome} />)
    await user.click(screen.getByRole("button", { name: "Jogar de novo" }))
    expect(onPlayAgain).toHaveBeenCalled()
  })

  it("botão Início chama callback", async () => {
    const user = userEvent.setup()
    render(<SessionSummary onPlayAgain={onPlayAgain} onGoHome={onGoHome} />)
    await user.click(screen.getByRole("button", { name: "Início" }))
    expect(onGoHome).toHaveBeenCalled()
  })
})
