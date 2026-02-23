import { z } from "zod"

export const createSessionSchema = z.object({
  operations: z.array(z.enum(["ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION"])).min(1),
  numbers: z.array(z.number().int()).min(1),
  totalQuestions: z.number().int().min(0).optional(),
  mode: z.enum(["PRACTICE", "TIMED_TOTAL", "TIMED_PER_QUESTION", "MARATHON", "REVIEW"]).optional().default("PRACTICE"),
  timeLimitSeconds: z.number().int().min(1).optional(),
  timeLimitPerQuestionSeconds: z.number().int().min(1).optional(),
})

export const endSessionSchema = z.object({
  completed: z.boolean(),
  correctAnswers: z.number().int().min(0),
  wrongAnswers: z.number().int().min(0),
  interruptedReason: z.string().optional(),
  totalQuestions: z.number().int().min(0).optional(),
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

export const resolveNotificationSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
})

export const adminEditUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["CHILD", "PARENT", "TEACHER", "ADMIN"]).optional(),
})

export const addFriendSchema = z.object({
  friendCode: z.string().min(1),
})

export const updateFriendshipSettingsSchema = z.object({
  friendshipEnabled: z.boolean().optional(),
  challengeEnabled: z.boolean().optional(),
})

export const updateChildSocialSchema = z.object({
  childId: z.string(),
  friendshipEnabled: z.boolean().optional(),
  challengeEnabled: z.boolean().optional(),
})

export const createChallengeSchema = z.object({
  friendId: z.string(),
  operations: z.array(z.enum(["ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION"])).min(1),
  numbers: z.array(z.number().int()).min(1),
  totalQuestions: z.number().int().min(5).max(50),
})

export const respondChallengeSchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE"]),
})

export const updateChallengeProgressSchema = z.object({
  correct: z.number().int().min(0),
  wrong: z.number().int().min(0),
  finished: z.boolean(),
  timeMs: z.number().int().optional(),
})

export const updateGroupLeaderboardSchema = z.object({
  leaderboardEnabled: z.boolean(),
})
