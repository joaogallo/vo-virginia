import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SessionSetup from "@/components/game/SessionSetup"
import { useGameStore } from "@/stores/game-store"

// Mock framer-motion — forward all HTML props
vi.mock("framer-motion", () => ({
  motion: {
    h1: (props: Record<string, unknown>) => {
      const { children, className } = props
      return <h1 className={className as string}>{children as React.ReactNode}</h1>
    },
    button: (props: Record<string, unknown>) => {
      const { children, onClick, disabled, className } = props
      const ariaPressed = props["aria-pressed"]
      const ariaLabel = props["aria-label"]
      return (
        <button
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
          disabled={disabled as boolean}
          className={className as string}
          aria-pressed={ariaPressed as boolean}
          aria-label={ariaLabel as string}
        >
          {children as React.ReactNode}
        </button>
      )
    },
    div: (props: Record<string, unknown>) => {
      const { children, className } = props
      return <div className={className as string}>{children as React.ReactNode}</div>
    },
  },
}))

describe("SessionSetup", () => {
  const onStart = vi.fn()

  beforeEach(() => {
    useGameStore.getState().resetSetup()
    onStart.mockClear()
  })

  it("renderiza título e seções", () => {
    render(<SessionSetup onStart={onStart} />)
    expect(screen.getByText("Vó Virgínia")).toBeInTheDocument()
    expect(screen.getByText("Operações")).toBeInTheDocument()
    expect(screen.getByText("Números")).toBeInTheDocument()
  })

  it("renderiza 4 operações", () => {
    render(<SessionSetup onStart={onStart} />)
    expect(screen.getByText("Adição")).toBeInTheDocument()
    expect(screen.getByText("Subtração")).toBeInTheDocument()
    expect(screen.getByText("Multiplicação")).toBeInTheDocument()
    expect(screen.getByText("Divisão")).toBeInTheDocument()
  })

  it("renderiza números de 0 a 10", () => {
    render(<SessionSetup onStart={onStart} />)
    for (let i = 0; i <= 10; i++) {
      expect(screen.getByRole("button", { name: `Número ${i}` })).toBeInTheDocument()
    }
  })

  it("botão Começar desabilitado sem seleção", () => {
    render(<SessionSetup onStart={onStart} />)
    const startButton = screen.getByRole("button", { name: "Começar!" })
    expect(startButton).toBeDisabled()
  })

  it("botão Começar habilitado após selecionar operação e número", async () => {
    const user = userEvent.setup()
    render(<SessionSetup onStart={onStart} />)

    await user.click(screen.getByText("Adição"))
    await user.click(screen.getByRole("button", { name: "Número 3" }))

    const startButton = screen.getByRole("button", { name: "Começar!" })
    expect(startButton).not.toBeDisabled()
  })

  it("click em Começar chama onStart", async () => {
    const user = userEvent.setup()
    render(<SessionSetup onStart={onStart} />)

    await user.click(screen.getByText("Adição"))
    await user.click(screen.getByRole("button", { name: "Número 3" }))
    await user.click(screen.getByRole("button", { name: "Começar!" }))

    expect(onStart).toHaveBeenCalled()
  })

  it("toggle de operação alterna aria-pressed", async () => {
    const user = userEvent.setup()
    render(<SessionSetup onStart={onStart} />)

    const addButton = screen.getByText("Adição").closest("button")!
    expect(addButton).toHaveAttribute("aria-pressed", "false")

    await user.click(addButton)
    expect(addButton).toHaveAttribute("aria-pressed", "true")

    await user.click(addButton)
    expect(addButton).toHaveAttribute("aria-pressed", "false")
  })
})
