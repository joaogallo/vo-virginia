import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createChallengeSchema } from "@/lib/validators"

function generateSeed(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let seed = ""
  for (let i = 0; i < 16; i++) {
    seed += chars[Math.floor(Math.random() * chars.length)]
  }
  return seed
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const challenges = await prisma.friendChallenge.findMany({
    where: {
      OR: [
        { challengerId: session.user.id },
        { challengedId: session.user.id },
      ],
      status: { in: ["PENDING", "ACTIVE", "COMPLETED"] },
    },
    include: {
      challenger: { select: { id: true, name: true } },
      challenged: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json({ challenges })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createChallengeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { friendId, operations, numbers, totalQuestions } = parsed.data

  // Verify both users have challengeEnabled
  const [currentUser, friend] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { challengeEnabled: true },
    }),
    prisma.user.findUnique({
      where: { id: friendId },
      select: { id: true, name: true, challengeEnabled: true },
    }),
  ])

  if (!currentUser?.challengeEnabled) {
    return NextResponse.json({ error: "Desafios não estão habilitados para sua conta" }, { status: 403 })
  }

  if (!friend?.challengeEnabled) {
    return NextResponse.json({ error: "Seu amigo não aceita desafios no momento" }, { status: 403 })
  }

  // Verify they are friends with ACTIVE status
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { initiatorId: session.user.id, receiverId: friendId },
        { initiatorId: friendId, receiverId: session.user.id },
      ],
    },
  })

  if (!friendship) {
    return NextResponse.json({ error: "Vocês não são amigos ou a amizade está bloqueada" }, { status: 403 })
  }

  const seed = generateSeed()

  const challenge = await prisma.friendChallenge.create({
    data: {
      challengerId: session.user.id,
      challengedId: friendId,
      operations: operations as ("ADDITION" | "SUBTRACTION" | "MULTIPLICATION" | "DIVISION")[],
      numbers,
      totalQuestions,
      questionsSeed: seed,
    },
  })

  // Notify friend
  await prisma.notification.create({
    data: {
      recipientId: friendId,
      senderId: session.user.id,
      type: "FRIEND_CHALLENGE_INVITE",
      data: {
        challengeId: challenge.id,
        challengerName: session.user.name,
        totalQuestions: String(totalQuestions),
      },
      status: "PENDING",
    },
  })

  return NextResponse.json({ challenge }, { status: 201 })
}
