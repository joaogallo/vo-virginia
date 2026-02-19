import { z } from "zod"

export const createSessionSchema = z.object({
  operations: z.array(z.enum(["ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION"])).min(1),
  numbers: z.array(z.number().int()).min(1),
  totalQuestions: z.number().int().min(1).optional(),
})

export const endSessionSchema = z.object({
  completed: z.boolean(),
  correctAnswers: z.number().int().min(0),
  wrongAnswers: z.number().int().min(0),
})

export const submitAnswersSchema = z.object({
  answers: z.array(
    z.object({
      operation: z.enum(["ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION"]),
      firstOperand: z.number().int(),
      secondOperand: z.number().int(),
      correctAnswer: z.number().int(),
      userAnswer: z.number().int(),
      isCorrect: z.boolean(),
      attemptNumber: z.number().int().min(1),
      timeSpentMs: z.number().int().min(0),
      answeredAt: z.string(),
    })
  ),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["CHILD", "PARENT", "TEACHER"]).default("CHILD"),
  linkCode: z.string().optional(),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  maxRetries: z.number().int().min(1).max(20).optional(),
  defaultQuestionLimit: z.number().int().min(1).max(500).nullable().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export const createGroupSchema = z.object({
  name: z.string().min(1, "Nome do grupo é obrigatório").max(50, "Nome muito longo"),
})

export const addGroupMembersSchema = z.object({
  childIds: z.array(z.string()).min(1, "Selecione pelo menos uma criança"),
})

export const removeGroupMemberSchema = z.object({
  childId: z.string(),
})
