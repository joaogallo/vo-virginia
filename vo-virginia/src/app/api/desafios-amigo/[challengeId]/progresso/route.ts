import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateChallengeProgressSchema } from "@/lib/validators"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { challengeId } = await params

  const challenge = await prisma.friendChallenge.findFirst({
    where: {
      id: challengeId,
      OR: [
        { challengerId: session.user.id },
        { challengedId: session.user.id },
      ],
    },
    include: {
      challenger: { select: { id: true, name: true } },
      challenged: { select: { id: true, name: true } },
    },
  })

  if (!challenge) {
    return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    status: challenge.status,
    totalQuestions: challenge.totalQuestions,
    challenger: {
      id: challenge.challenger.id,
      name: challenge.challenger.name,
      correct: challenge.challengerCorrect,
      wrong: challenge.challengerWrong,
      finished: challenge.challengerFinished,
      timeMs: challenge.challengerTime,
    },
    challenged: {
      id: challenge.challenged.id,
      name: challenge.challenged.name,
      correct: challenge.challengedCorrect,
      wrong: challenge.challengedWrong,
      finished: challenge.challengedFinished,
      timeMs: challenge.challengedTime,
    },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { challengeId } = await params
  const body = await req.json()
  const parsed = updateChallengeProgressSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const challenge = await prisma.friendChallenge.findFirst({
    where: {
      id: challengeId,
      status: "ACTIVE",
      OR: [
        { challengerId: session.user.id },
        { challengedId: session.user.id },
      ],
    },
  })

  if (!challenge) {
    return NextResponse.json({ error: "Desafio não encontrado ou não ativo" }, { status: 404 })
  }

  const isChallenger = challenge.challengerId === session.user.id
  const { correct, wrong, finished, timeMs } = parsed.data

  const updateData: Record<string, unknown> = isChallenger
    ? {
        challengerCorrect: correct,
        challengerWrong: wrong,
        challengerFinished: finished,
        ...(timeMs !== undefined ? { challengerTime: timeMs } : {}),
      }
    : {
        challengedCorrect: correct,
        challengedWrong: wrong,
        challengedFinished: finished,
        ...(timeMs !== undefined ? { challengedTime: timeMs } : {}),
      }

  const updated = await prisma.friendChallenge.update({
    where: { id: challengeId },
    data: updateData,
  })

  // Check if both players finished
  const bothFinished = isChallenger
    ? finished && updated.challengedFinished
    : updated.challengerFinished && finished

  if (bothFinished) {
    await prisma.friendChallenge.update({
      where: { id: challengeId },
      data: { status: "COMPLETED", completedAt: new Date() },
    })

    // Notify both players
    const challengerScore = `${isChallenger ? correct : updated.challengerCorrect}/${challenge.totalQuestions}`
    const challengedScore = `${isChallenger ? updated.challengedCorrect : correct}/${challenge.totalQuestions}`

    await prisma.notification.createMany({
      data: [
        {
          recipientId: challenge.challengerId,
          senderId: challenge.challengedId,
          type: "FRIEND_CHALLENGE_RESULT",
          data: {
            challengeId,
            yourScore: challengerScore,
            opponentScore: challengedScore,
            challengedName: "",
          },
          status: "APPROVED",
        },
        {
          recipientId: challenge.challengedId,
          senderId: challenge.challengerId,
          type: "FRIEND_CHALLENGE_RESULT",
          data: {
            challengeId,
            yourScore: challengedScore,
            opponentScore: challengerScore,
            challengerName: "",
          },
          status: "APPROVED",
        },
      ],
    })
  }

  return NextResponse.json({ success: true, completed: bothFinished })
}
