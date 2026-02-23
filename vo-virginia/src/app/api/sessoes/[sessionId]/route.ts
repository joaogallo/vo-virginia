import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { endSessionSchema } from "@/lib/validators"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { sessionId } = await params

  const gameSession = await prisma.gameSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: { answers: { orderBy: { answeredAt: "asc" } } },
  })

  if (!gameSession) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
  }

  return NextResponse.json(gameSession)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { sessionId } = await params
  const body = await req.json()
  const parsed = endSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { interruptedReason, totalQuestions, ...rest } = parsed.data
  const updateData: Record<string, unknown> = {
    ...rest,
    endedAt: new Date(),
  }
  if (interruptedReason) {
    updateData.interruptedAt = new Date()
    updateData.interruptedReason = interruptedReason
  }
  if (totalQuestions !== undefined) {
    updateData.totalQuestions = totalQuestions
  }

  const gameSession = await prisma.gameSession.updateMany({
    where: { id: sessionId, userId: session.user.id },
    data: updateData,
  })

  if (gameSession.count === 0) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
  }

  // Notify linked adults when child completes a session
  if (parsed.data.completed) {
    try {
      const linkedAdults = await prisma.parentChild.findMany({
        where: { childId: session.user.id },
        select: { parentId: true },
      })

      if (linkedAdults.length > 0) {
        const { correctAnswers, totalQuestions: tq } = parsed.data
        const total = tq ?? parsed.data.correctAnswers + parsed.data.wrongAnswers
        const accuracy = total > 0 ? Math.round((correctAnswers / total) * 100) : 0

        await prisma.notification.createMany({
          data: linkedAdults.map((link) => ({
            recipientId: link.parentId,
            senderId: session.user.id,
            type: "SESSION_COMPLETED",
            data: {
              childName: session.user.name,
              correctAnswers: String(correctAnswers),
              totalQuestions: String(total),
              accuracy: String(accuracy),
            },
            status: "APPROVED" as const,
          })),
        })
      }
    } catch {
      // Don't fail the session end if notifications fail
    }
  }

  return NextResponse.json({ success: true })
}
