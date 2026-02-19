import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createGroupSchema } from "@/lib/validators"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role === "CHILD") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const groups = await prisma.childGroup.findMany({
    where: { userId: session.user.id },
    include: {
      members: {
        include: {
          child: {
            select: { id: true, name: true, image: true },
          },
        },
      },
      _count: { select: { members: true } },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ groups })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role === "CHILD") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createGroupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const group = await prisma.childGroup.create({
    data: {
      name: parsed.data.name,
      userId: session.user.id,
    },
  })

  return NextResponse.json({ group }, { status: 201 })
}
