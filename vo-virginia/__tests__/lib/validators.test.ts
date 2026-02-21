import { describe, it, expect } from "vitest"
import {
  createSessionSchema,
  endSessionSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validators"

describe("createSessionSchema", () => {
  it("aceita dados válidos", () => {
    const result = createSessionSchema.safeParse({
      operations: ["ADDITION", "SUBTRACTION"],
      numbers: [1, 2, 3],
      totalQuestions: 10,
    })
    expect(result.success).toBe(true)
  })

  it("aceita sem totalQuestions (opcional)", () => {
    const result = createSessionSchema.safeParse({
      operations: ["MULTIPLICATION"],
      numbers: [5],
    })
    expect(result.success).toBe(true)
  })

  it("rejeita operações inválidas", () => {
    const result = createSessionSchema.safeParse({
      operations: ["INVALID_OP"],
      numbers: [1],
    })
    expect(result.success).toBe(false)
  })

  it("rejeita operations vazio", () => {
    const result = createSessionSchema.safeParse({
      operations: [],
      numbers: [1],
    })
    expect(result.success).toBe(false)
  })

  it("rejeita numbers vazio", () => {
    const result = createSessionSchema.safeParse({
      operations: ["ADDITION"],
      numbers: [],
    })
    expect(result.success).toBe(false)
  })
})

describe("endSessionSchema", () => {
  it("aceita dados válidos", () => {
    const result = endSessionSchema.safeParse({
      completed: true,
      correctAnswers: 8,
      wrongAnswers: 2,
    })
    expect(result.success).toBe(true)
  })

  it("rejeita correctAnswers negativo", () => {
    const result = endSessionSchema.safeParse({
      completed: true,
      correctAnswers: -1,
      wrongAnswers: 0,
    })
    expect(result.success).toBe(false)
  })

  it("rejeita sem completed", () => {
    const result = endSessionSchema.safeParse({
      correctAnswers: 5,
      wrongAnswers: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  it("aceita dados válidos", () => {
    const result = registerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
      password: "123456",
      role: "CHILD",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita email inválido", () => {
    const result = registerSchema.safeParse({
      name: "Maria",
      email: "nao-eh-email",
      password: "123456",
    })
    expect(result.success).toBe(false)
  })

  it("rejeita senha curta", () => {
    const result = registerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
      password: "12345",
    })
    expect(result.success).toBe(false)
  })

  it("rejeita nome curto", () => {
    const result = registerSchema.safeParse({
      name: "M",
      email: "maria@email.com",
      password: "123456",
    })
    expect(result.success).toBe(false)
  })

  it("default role é CHILD", () => {
    const result = registerSchema.safeParse({
      name: "Maria",
      email: "maria@email.com",
      password: "123456",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.role).toBe("CHILD")
    }
  })
})

describe("updateProfileSchema", () => {
  it("aceita maxRetries válido", () => {
    const result = updateProfileSchema.safeParse({ maxRetries: 10 })
    expect(result.success).toBe(true)
  })

  it("rejeita maxRetries > 20", () => {
    const result = updateProfileSchema.safeParse({ maxRetries: 21 })
    expect(result.success).toBe(false)
  })

  it("rejeita maxRetries < 1", () => {
    const result = updateProfileSchema.safeParse({ maxRetries: 0 })
    expect(result.success).toBe(false)
  })
})

describe("changePasswordSchema", () => {
  it("aceita senha válida", () => {
    const result = changePasswordSchema.safeParse({
      newPassword: "novaSenha123",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita senha curta", () => {
    const result = changePasswordSchema.safeParse({
      newPassword: "12345",
    })
    expect(result.success).toBe(false)
  })
})
