import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateChildSocialSchema } from "@/lib/validators"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  if (session.user.role !== "PARENT" && session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas responsáveis podem alterar configurações sociais" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updateChildSocialSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { childId, ...settings } = parsed.data

  // Verify the adult is linked to this child
  if (session.user.role !== "ADMIN") {
    const link = await prisma.parentChild.findFirst({
      where: { parentId: session.user.id, childId },
    })
    if (!link) {
      return NextResponse.json({ error: "Criança não vinculada" }, { status: 403 })
    }
  }

  const updated = await prisma.user.update({
    where: { id: childId },
    data: settings,
    select: { id: true, friendshipEnabled: true, challengeEnabled: true },
  })

  return NextResponse.json(updated)
}
