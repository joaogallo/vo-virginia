import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { respondChallengeSchema } from "@/lib/validators"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { challengeId } = await params
  const body = await req.json()
  const parsed = respondChallengeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const challenge = await prisma.friendChallenge.findFirst({
    where: {
      id: challengeId,
      challengedId: session.user.id,
      status: "PENDING",
    },
    include: {
      challenger: { select: { name: true } },
    },
  })

  if (!challenge) {
    return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 })
  }

  // Check if challenge has expired
  if (challenge.expiresAt && new Date() > challenge.expiresAt) {
    await prisma.friendChallenge.update({
      where: { id: challengeId },
      data: { status: "CANCELLED" },
    })
    return NextResponse.json({ error: "Este desafio expirou" }, { status: 410 })
  }

  if (parsed.data.action === "ACCEPT") {
    await prisma.friendChallenge.update({
      where: { id: challengeId },
      data: { status: "ACTIVE", startedAt: new Date() },
    })

    // Mark the invite notification as read
    await prisma.notification.updateMany({
      where: {
        recipientId: session.user.id,
        type: "FRIEND_CHALLENGE_INVITE",
        data: { path: ["challengeId"], equals: challengeId },
        status: "PENDING",
      },
      data: { status: "APPROVED", readAt: new Date() },
    })

    return NextResponse.json({ status: "ACTIVE" })
  }

  // DECLINE
  await prisma.friendChallenge.update({
    where: { id: challengeId },
    data: { status: "DECLINED" },
  })

  // Notify challenger
  await prisma.notification.create({
    data: {
      recipientId: challenge.challengerId,
      senderId: session.user.id,
      type: "FRIEND_CHALLENGE_RESULT",
      data: {
        challengeId,
        challengedName: session.user.name,
        result: "declined",
      },
      status: "APPROVED",
    },
  })

  // Mark invite notification as resolved
  await prisma.notification.updateMany({
    where: {
      recipientId: session.user.id,
      type: "FRIEND_CHALLENGE_INVITE",
      data: { path: ["challengeId"], equals: challengeId },
      status: "PENDING",
    },
    data: { status: "REJECTED", readAt: new Date() },
  })

  return NextResponse.json({ status: "DECLINED" })
}
