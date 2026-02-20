import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateStats, periodToDate } from "@/lib/stats-calculator"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const userId = session.user.id
  const period = req.nextUrl.searchParams.get("period") || "all"
  const sinceDate = periodToDate(period)

  const dateFilter = sinceDate ? { gte: sinceDate } : undefined

  const [sessions, answers] = await Promise.all([
    prisma.gameSession.findMany({
      where: {
        userId,
        ...(dateFilter && { startedAt: dateFilter }),
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.answer.findMany({
      where: {
        session: { userId },
        ...(dateFilter && { answeredAt: dateFilter }),
      },
    }),
  ])

  return NextResponse.json(calculateStats(sessions, answers))
}
