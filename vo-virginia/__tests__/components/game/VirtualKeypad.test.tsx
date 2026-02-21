import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import VirtualKeypad from "@/components/game/VirtualKeypad"

// Mock framer-motion — forward all standard HTML props
vi.mock("framer-motion", () => ({
  motion: {
    button: (props: Record<string, unknown>) => {
      const { children, onClick, disabled, className, "aria-label": ariaLabel } = props
      return (
        <button
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
          disabled={disabled as boolean}
          className={className as string}
          aria-label={ariaLabel as string}
        >
          {children as React.ReactNode}
        </button>
      )
    },
  },
}))

describe("VirtualKeypad", () => {
  const defaultProps = {
    onDigit: vi.fn(),
    onBackspace: vi.fn(),
    onClear: vi.fn(),
    onConfirm: vi.fn(),
    disabled: false,
  }

  it("renderiza 10 dígitos (0-9)", () => {
    render(<VirtualKeypad {...defaultProps} />)
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole("button", { name: String(i) })).toBeInTheDocument()
    }
  })

  it("renderiza botões especiais", () => {
    render(<VirtualKeypad {...defaultProps} />)
    expect(screen.getByRole("button", { name: "Apagar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Limpar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Confirmar resposta" })).toBeInTheDocument()
  })

  it("click em dígito chama onDigit", async () => {
    const user = userEvent.setup()
    const onDigit = vi.fn()
    render(<VirtualKeypad {...defaultProps} onDigit={onDigit} />)

    await user.click(screen.getByRole("button", { name: "5" }))
    expect(onDigit).toHaveBeenCalledWith("5")
  })

  it("click em ⌫ chama onBackspace", async () => {
    const user = userEvent.setup()
    const onBackspace = vi.fn()
    render(<VirtualKeypad {...defaultProps} onBackspace={onBackspace} />)

    await user.click(screen.getByRole("button", { name: "Apagar" }))
    expect(onBackspace).toHaveBeenCalled()
  })

  it("click em C chama onClear", async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(<VirtualKeypad {...defaultProps} onClear={onClear} />)

    await user.click(screen.getByRole("button", { name: "Limpar" }))
    expect(onClear).toHaveBeenCalled()
  })

  it("click em OK chama onConfirm", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<VirtualKeypad {...defaultProps} onConfirm={onConfirm} />)

    await user.click(screen.getByRole("button", { name: "Confirmar resposta" }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it("botões não chamam callbacks quando disabled=true", async () => {
    const user = userEvent.setup()
    const onDigit = vi.fn()
    render(<VirtualKeypad {...defaultProps} onDigit={onDigit} disabled={true} />)

    const button5 = screen.getByRole("button", { name: "5" })
    await user.click(button5).catch(() => {})
    expect(onDigit).not.toHaveBeenCalled()
  })
})
