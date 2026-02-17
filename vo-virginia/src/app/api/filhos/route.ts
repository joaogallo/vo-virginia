import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role === "CHILD") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const links = await prisma.parentChild.findMany({
    where: { parentId: session.user.id },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          gameSessions: {
            orderBy: { startedAt: "desc" },
            take: 1,
            select: { startedAt: true },
          },
          _count: { select: { gameSessions: true } },
        },
      },
    },
  })

  const children = links.map((link) => ({
    id: link.child.id,
    name: link.child.name,
    email: link.child.email,
    image: link.child.image,
    lastSessionAt: link.child.gameSessions[0]?.startedAt || null,
    totalSessions: link.child._count.gameSessions,
  }))

  return NextResponse.json({ children })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role === "CHILD") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { childEmail, linkCode } = body

  let child = null

  if (linkCode) {
    child = await prisma.user.findFirst({
      where: { linkCode, role: "CHILD" },
    })
  } else if (childEmail) {
    child = await prisma.user.findFirst({
      where: { email: childEmail, role: "CHILD" },
    })
  }

  if (!child) {
    return NextResponse.json({ error: "Criança não encontrada" }, { status: 404 })
  }

  // Verificar se já está vinculado
  const existing = await prisma.parentChild.findFirst({
    where: { parentId: session.user.id, childId: child.id },
  })

  if (existing) {
    return NextResponse.json({ error: "Criança já vinculada" }, { status: 409 })
  }

  await prisma.parentChild.create({
    data: {
      parentId: session.user.id,
      childId: child.id,
    },
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
