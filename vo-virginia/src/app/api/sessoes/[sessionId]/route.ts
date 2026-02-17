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

  const gameSession = await prisma.gameSession.updateMany({
    where: { id: sessionId, userId: session.user.id },
    data: {
      ...parsed.data,
      endedAt: new Date(),
    },
  })

  if (gameSession.count === 0) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
