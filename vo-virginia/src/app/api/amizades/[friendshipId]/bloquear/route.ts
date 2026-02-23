import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ friendshipId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  if (session.user.role !== "PARENT" && session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas responsáveis podem bloquear amizades" }, { status: 403 })
  }

  const { friendshipId } = await params
  const body = await req.json()
  const blocked = body.blocked === true

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
    select: { initiatorId: true, receiverId: true },
  })

  if (!friendship) {
    return NextResponse.json({ error: "Amizade não encontrada" }, { status: 404 })
  }

  // Verify that the adult is a parent of one of the children in this friendship
  const isParentOfChild = await prisma.parentChild.findFirst({
    where: {
      parentId: session.user.id,
      childId: { in: [friendship.initiatorId, friendship.receiverId] },
    },
  })

  if (!isParentOfChild && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Você não é responsável por nenhuma das crianças nesta amizade" }, { status: 403 })
  }

  await prisma.friendship.update({
    where: { id: friendshipId },
    data: blocked
      ? { status: "BLOCKED", blockedBy: session.user.id }
      : { status: "ACTIVE", blockedBy: null },
  })

  return NextResponse.json({ success: true })
}
