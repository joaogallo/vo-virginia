import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { sessionId } = await params

  const gameSession = await prisma.gameSession.findUnique({
    where: { id: sessionId },
  })

  if (!gameSession) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
  }

  await prisma.gameSession.delete({
    where: { id: sessionId },
  })

  return NextResponse.json({ success: true })
}
