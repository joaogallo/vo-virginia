import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { submitAnswersSchema } from "@/lib/validators"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { sessionId } = await params

  // Verificar que a sessão pertence ao usuário
  const gameSession = await prisma.gameSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
  })

  if (!gameSession) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = submitAnswersSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Inserir respostas em batch
  await prisma.answer.createMany({
    data: parsed.data.answers.map((a) => ({
      sessionId,
      operation: a.operation,
      firstOperand: a.firstOperand,
      secondOperand: a.secondOperand,
      correctAnswer: a.correctAnswer,
      userAnswer: a.userAnswer,
      isCorrect: a.isCorrect,
      attemptNumber: a.attemptNumber,
      timeSpentMs: a.timeSpentMs,
      answeredAt: new Date(a.answeredAt),
    })),
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
