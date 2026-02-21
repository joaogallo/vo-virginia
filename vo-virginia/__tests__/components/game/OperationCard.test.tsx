import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import OperationCard from "@/components/game/OperationCard"
import type { Question } from "@/types/game"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: (props: Record<string, unknown>) => {
      const { children, className } = props
      return <div className={className as string}>{children as React.ReactNode}</div>
    },
    span: (props: Record<string, unknown>) => {
      const { children, className } = props
      return <span className={className as string}>{children as React.ReactNode}</span>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const makeQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: "q-test-1",
  operation: "addition",
  displayFirst: 3,
  displaySecond: 7,
  operationSymbol: "+",
  correctAnswer: 10,
  _genX: 3,
  _genY: 7,
  ...overrides,
})

describe("OperationCard", () => {
  it("renderiza números e operação", () => {
    render(
      <OperationCard
        question={makeQuestion()}
        inputValue=""
        feedbackType={null}
        showingFeedback={false}
        currentAttempt={1}
        maxRetries={5}
      />
    )

    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("7")).toBeInTheDocument()
    expect(screen.getByText("+")).toBeInTheDocument()
    expect(screen.getByText("=")).toBeInTheDocument()
  })

  it("mostra input do usuário", () => {
    render(
      <OperationCard
        question={makeQuestion()}
        inputValue="15"
        feedbackType={null}
        showingFeedback={false}
        currentAttempt={1}
        maxRetries={5}
      />
    )

    expect(screen.getByText("15")).toBeInTheDocument()
  })

  it("mostra placeholder ? quando sem input", () => {
    const { container } = render(
      <OperationCard
        question={makeQuestion()}
        inputValue=""
        feedbackType={null}
        showingFeedback={false}
        currentAttempt={1}
        maxRetries={5}
      />
    )

    const placeholder = container.querySelector(".animate-pulse")
    expect(placeholder).toBeInTheDocument()
    expect(placeholder!.textContent).toBe("?")
  })

  it("feedback correto mostra resposta correta", () => {
    render(
      <OperationCard
        question={makeQuestion()}
        inputValue="10"
        feedbackType="correct"
        showingFeedback={true}
        currentAttempt={1}
        maxRetries={5}
      />
    )

    const elements = screen.getAllByText("10")
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it("screen reader descreve a questão com aria-live", () => {
    const { container } = render(
      <OperationCard
        question={makeQuestion()}
        inputValue=""
        feedbackType={null}
        showingFeedback={false}
        currentAttempt={1}
        maxRetries={5}
      />
    )

    const srOnly = container.querySelector("[aria-live='polite']")
    expect(srOnly).toBeInTheDocument()
    expect(srOnly!.textContent).toContain("3")
    expect(srOnly!.textContent).toContain("mais")
    expect(srOnly!.textContent).toContain("7")
  })

  it("mostra tentativas quando currentAttempt > 1", () => {
    render(
      <OperationCard
        question={makeQuestion()}
        inputValue=""
        feedbackType={null}
        showingFeedback={false}
        currentAttempt={2}
        maxRetries={5}
      />
    )

    expect(screen.getByText("2/5")).toBeInTheDocument()
  })

  it("renderiza operação de subtração", () => {
    render(
      <OperationCard
        question={makeQuestion({
          operation: "subtraction",
          displayFirst: 10,
          displaySecond: 3,
          operationSymbol: "−",
          correctAnswer: 7,
        })}
        inputValue=""
        feedbackType={null}
        showingFeedback={false}
        currentAttempt={1}
        maxRetries={5}
      />
    )

    expect(screen.getByText("−")).toBeInTheDocument()
  })
})
