import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "30")

  const missedQuestions = await prisma.answer.groupBy({
    by: ["operation", "firstOperand", "secondOperand", "correctAnswer"],
    where: {
      session: { userId: session.user.id },
      isCorrect: false,
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  })

  return NextResponse.json({
    questions: missedQuestions.map((q) => ({
      operation: q.operation,
      firstOperand: q.firstOperand,
      secondOperand: q.secondOperand,
      correctAnswer: q.correctAnswer,
      errorCount: q._count.id,
    })),
  })
}
