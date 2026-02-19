import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addGroupMembersSchema, removeGroupMemberSchema } from "@/lib/validators"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role === "CHILD") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { groupId } = await params
  const body = await req.json()
  const parsed = addGroupMembersSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  // Verify group ownership
  const group = await prisma.childGroup.findFirst({
    where: { id: groupId, userId: session.user.id },
  })
  if (!group) {
    return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 })
  }

  // Verify all children are linked to this adult
  const links = await prisma.parentChild.findMany({
    where: {
      parentId: session.user.id,
      childId: { in: parsed.data.childIds },
    },
  })
  const linkedChildIds = new Set(links.map((l) => l.childId))
  const unauthorized = parsed.data.childIds.filter((id) => !linkedChildIds.has(id))
  if (unauthorized.length > 0) {
    return NextResponse.json({ error: "Crianças não vinculadas" }, { status: 403 })
  }

  await prisma.childGroupMember.createMany({
    data: parsed.data.childIds.map((childId) => ({ groupId, childId })),
    skipDuplicates: true,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role === "CHILD") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { groupId } = await params
  const body = await req.json()
  const parsed = removeGroupMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  // Verify group ownership
  const group = await prisma.childGroup.findFirst({
    where: { id: groupId, userId: session.user.id },
  })
  if (!group) {
    return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 })
  }

  await prisma.childGroupMember.deleteMany({
    where: { groupId, childId: parsed.data.childId },
  })

  return NextResponse.json({ success: true })
}
