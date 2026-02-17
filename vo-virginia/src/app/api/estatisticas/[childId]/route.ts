import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { childId } = await params

  // Verificar que o usuário é pai/professor da criança
  const link = await prisma.parentChild.findFirst({
    where: { parentId: session.user.id, childId },
  })

  if (!link) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const [sessions, answers] = await Promise.all([
    prisma.gameSession.findMany({
      where: { userId: childId },
      orderBy: { startedAt: "desc" },
      take: 20,
    }),
    prisma.answer.findMany({
      where: { session: { userId: childId } },
    }),
  ])

  const totalSessions = sessions.length
  const totalQuestions = answers.length
  const totalCorrect = answers.filter((a) => a.isCorrect).length
  const totalWrong = answers.filter((a) => !a.isCorrect).length
  const accuracyPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  const averageTimeMs = totalQuestions > 0
    ? Math.round(answers.reduce((sum, a) => sum + a.timeSpentMs, 0) / totalQuestions)
    : 0

  const operations = ["ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION"] as const
  const byOperation: Record<string, { total: number; correct: number; accuracyPercent: number; averageTimeMs: number }> = {}

  for (const op of operations) {
    const opAnswers = answers.filter((a) => a.operation === op)
    const opCorrect = opAnswers.filter((a) => a.isCorrect).length
    byOperation[op] = {
      total: opAnswers.length,
      correct: opCorrect,
      accuracyPercent: opAnswers.length > 0 ? Math.round((opCorrect / opAnswers.length) * 100) : 0,
      averageTimeMs: opAnswers.length > 0
        ? Math.round(opAnswers.reduce((sum, a) => sum + a.timeSpentMs, 0) / opAnswers.length)
        : 0,
    }
  }

  return NextResponse.json({
    totalSessions,
    totalQuestions,
    totalCorrect,
    totalWrong,
    accuracyPercent,
    averageTimeMs,
    byOperation,
    recentSessions: sessions,
  })
}
