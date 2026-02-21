import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { userId } = await params

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  const sessions = await prisma.gameSession.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      operations: true,
      numbers: true,
      totalQuestions: true,
      correctAnswers: true,
      wrongAnswers: true,
      startedAt: true,
      endedAt: true,
      completed: true,
    },
  })

  return NextResponse.json({ user, sessions })
}
