import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const page = parseInt(req.nextUrl.searchParams.get("page") || "1")
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20")
  const skip = (page - 1) * limit

  const [sessions, total] = await Promise.all([
    prisma.gameSession.findMany({
      where: { userId: session.user.id, mode: { not: "PRACTICE" } },
      orderBy: { startedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.gameSession.count({
      where: { userId: session.user.id, mode: { not: "PRACTICE" } },
    }),
  ])

  return NextResponse.json({ sessions, total, page })
}
