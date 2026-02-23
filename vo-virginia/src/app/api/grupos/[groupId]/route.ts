import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createGroupSchema } from "@/lib/validators"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role === "CHILD") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { groupId } = await params
  const body = await req.json()

  const group = await prisma.childGroup.findFirst({
    where: { id: groupId, userId: session.user.id },
  })

  if (!group) {
    return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}

  // Handle name update
  if (body.name !== undefined) {
    const parsed = createGroupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    updateData.name = parsed.data.name
  }

  // Handle leaderboard toggle
  if (typeof body.leaderboardEnabled === "boolean") {
    updateData.leaderboardEnabled = body.leaderboardEnabled
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 })
  }

  const updated = await prisma.childGroup.update({
    where: { id: groupId },
    data: updateData,
  })

  return NextResponse.json({ group: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role === "CHILD") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { groupId } = await params

  const group = await prisma.childGroup.findFirst({
    where: { id: groupId, userId: session.user.id },
  })

  if (!group) {
    return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 })
  }

  await prisma.childGroup.delete({ where: { id: groupId } })

  return NextResponse.json({ success: true })
}
