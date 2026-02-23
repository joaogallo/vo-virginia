import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

  return NextResponse.json({ challenge })
}
