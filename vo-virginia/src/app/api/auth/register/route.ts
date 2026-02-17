import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validators"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, email, password, role, linkCode } = parsed.data

  // Verificar se email já existe
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: "Email já cadastrado" },
      { status: 409 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  // Gerar linkCode para pais/professores
  const userLinkCode = role !== "CHILD"
    ? crypto.randomBytes(4).toString("hex").toUpperCase()
    : null

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as "CHILD" | "PARENT" | "TEACHER",
      linkCode: userLinkCode,
    },
  })

  // Se criança forneceu código, vincular ao responsável
  if (role === "CHILD" && linkCode) {
    const parent = await prisma.user.findFirst({
      where: { linkCode, role: { in: ["PARENT", "TEACHER"] } },
    })

    if (parent) {
      await prisma.parentChild.create({
        data: {
          parentId: parent.id,
          childId: user.id,
        },
      })
    }
  }

  return NextResponse.json(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    { status: 201 }
  )
}
