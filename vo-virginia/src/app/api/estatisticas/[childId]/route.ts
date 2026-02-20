import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateStats, periodToDate } from "@/lib/stats-calculator"

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

  const period = req.nextUrl.searchParams.get("period") || "all"
  const sinceDate = periodToDate(period)

  const dateFilter = sinceDate ? { gte: sinceDate } : undefined

  const [sessions, answers] = await Promise.all([
    prisma.gameSession.findMany({
      where: {
        userId: childId,
        ...(dateFilter && { startedAt: dateFilter }),
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.answer.findMany({
      where: {
        session: { userId: childId },
        ...(dateFilter && { answeredAt: dateFilter }),
      },
    }),
  ])

  return NextResponse.json(calculateStats(sessions, answers))
}
