import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ friendshipId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { friendshipId } = await params

  const friendship = await prisma.friendship.findFirst({
    where: {
      id: friendshipId,
      OR: [
        { initiatorId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
  })

  if (!friendship) {
    return NextResponse.json({ error: "Amizade não encontrada" }, { status: 404 })
  }

  await prisma.friendship.delete({ where: { id: friendshipId } })

  return NextResponse.json({ success: true })
}
