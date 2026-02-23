import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addFriendSchema } from "@/lib/validators"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  // Parents can view their child's friends
  const { searchParams } = new URL(req.url)
  const childId = searchParams.get("childId")
  const targetUserId = childId || session.user.id

  if (childId) {
    // Verify parent-child link
    if (session.user.role !== "ADMIN") {
      const link = await prisma.parentChild.findFirst({
        where: { parentId: session.user.id, childId },
      })
      if (!link) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
      }
    }
  }

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { initiatorId: targetUserId },
        { receiverId: targetUserId },
      ],
    },
    include: {
      initiator: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const friends = friendships.map((f) => {
    const friend = f.initiatorId === targetUserId ? f.receiver : f.initiator
    return {
      id: friend.id,
      name: friend.name,
      friendshipId: f.id,
      status: f.status,
      blockedBy: f.blockedBy,
    }
  })

  return NextResponse.json({ friends })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = addFriendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { friendshipEnabled: true },
  })

  if (!currentUser?.friendshipEnabled) {
    return NextResponse.json({ error: "Amizades não estão habilitadas para sua conta" }, { status: 403 })
  }

  const friend = await prisma.user.findFirst({
    where: { friendCode: parsed.data.friendCode },
    select: { id: true, name: true, friendshipEnabled: true },
  })

  if (!friend) {
    return NextResponse.json({ error: "Código não encontrado" }, { status: 404 })
  }

  if (friend.id === session.user.id) {
    return NextResponse.json({ error: "Você não pode adicionar a si mesmo" }, { status: 400 })
  }

  if (!friend.friendshipEnabled) {
    return NextResponse.json({ error: "Este usuário não aceita amizades no momento" }, { status: 403 })
  }

  // Check if friendship already exists (either direction)
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { initiatorId: session.user.id, receiverId: friend.id },
        { initiatorId: friend.id, receiverId: session.user.id },
      ],
    },
  })

  if (existing) {
    return NextResponse.json({ error: "Vocês já são amigos" }, { status: 409 })
  }

  const friendship = await prisma.friendship.create({
    data: {
      initiatorId: session.user.id,
      receiverId: friend.id,
    },
  })

  // Notify the friend
  await prisma.notification.create({
    data: {
      recipientId: friend.id,
      senderId: session.user.id,
      type: "FRIENDSHIP_CREATED",
      data: { friendName: session.user.name },
      status: "APPROVED",
    },
  })

  return NextResponse.json({
    friendshipId: friendship.id,
    friendName: friend.name,
  }, { status: 201 })
}
