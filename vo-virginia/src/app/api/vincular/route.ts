import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  if (session.user.role !== "CHILD") {
    return NextResponse.json({ error: "Apenas crianças podem listar adultos vinculados" }, { status: 403 })
  }

  const links = await prisma.parentChild.findMany({
    where: { childId: session.user.id },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
    },
  })

  const adults = links.map((link) => ({
    id: link.parent.id,
    name: link.parent.name,
    email: link.parent.email,
    image: link.parent.image,
    role: link.parent.role,
  }))

  return NextResponse.json({ adults })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  if (session.user.role !== "CHILD") {
    return NextResponse.json({ error: "Apenas crianças podem vincular adultos" }, { status: 403 })
  }

  const body = await req.json()
  const { linkCode } = body

  if (!linkCode) {
    return NextResponse.json({ error: "Código de vinculação é obrigatório" }, { status: 400 })
  }

  const adult = await prisma.user.findFirst({
    where: { linkCode, role: { in: ["PARENT", "TEACHER"] } },
  })

  if (!adult) {
    return NextResponse.json({ error: "Código não encontrado" }, { status: 404 })
  }

  const existing = await prisma.parentChild.findFirst({
    where: { parentId: adult.id, childId: session.user.id },
  })

  if (existing) {
    return NextResponse.json({ error: "Adulto já vinculado" }, { status: 409 })
  }

  await prisma.parentChild.create({
    data: {
      parentId: adult.id,
      childId: session.user.id,
    },
  })

  return NextResponse.json({ success: true, adultName: adult.name }, { status: 201 })
}
