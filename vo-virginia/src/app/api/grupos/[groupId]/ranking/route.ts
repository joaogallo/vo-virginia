import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { groupId } = await params
  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") || "30"

  const group = await prisma.childGroup.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          child: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!group) {
    return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 })
  }

  // Check access: owner or member
  const isOwner = group.userId === session.user.id
  const isMember = group.members.some((m) => m.childId === session.user.id)

  if (!isOwner && !isMember && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  if (!group.leaderboardEnabled && !isOwner && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Quadro de líderes desabilitado" }, { status: 403 })
  }

  // Calculate date filter
  const now = new Date()
  const daysAgo = parseInt(period)
  const dateFilter = daysAgo > 0
    ? new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    : undefined

  const memberIds = group.members.map((m) => m.childId)

  // Fetch sessions for all members
  const sessions = await prisma.gameSession.findMany({
    where: {
      userId: { in: memberIds },
      completed: true,
      ...(dateFilter ? { startedAt: { gte: dateFilter } } : {}),
    },
    select: {
      userId: true,
      correctAnswers: true,
      totalQuestions: true,
      startedAt: true,
      endedAt: true,
    },
  })

  // Aggregate per member
  const memberStats = group.members.map((m) => {
    const memberSessions = sessions.filter((s) => s.userId === m.childId)
    const totalCorrect = memberSessions.reduce((sum, s) => sum + s.correctAnswers, 0)
    const totalQuestions = memberSessions.reduce((sum, s) => sum + s.totalQuestions, 0)
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

    let avgTimeMs = 0
    const sessionsWithTime = memberSessions.filter((s) => s.endedAt)
    if (sessionsWithTime.length > 0) {
      const totalTime = sessionsWithTime.reduce(
        (sum, s) => sum + (new Date(s.endedAt!).getTime() - new Date(s.startedAt).getTime()),
        0
      )
      avgTimeMs = Math.round(totalTime / sessionsWithTime.length)
    }

    return {
      id: m.childId,
      name: m.child.name,
      totalSessions: memberSessions.length,
      accuracy,
      totalCorrect,
      totalQuestions,
      avgTimeMs,
    }
  })

  // Sort by accuracy desc, then by total sessions desc
  memberStats.sort((a, b) => {
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy
    return b.totalSessions - a.totalSessions
  })

  return NextResponse.json({
    groupName: group.name,
    leaderboardEnabled: group.leaderboardEnabled,
    ranking: memberStats,
  })
}
