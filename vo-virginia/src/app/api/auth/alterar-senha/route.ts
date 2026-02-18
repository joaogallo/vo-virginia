import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { changePasswordSchema } from "@/lib/validators"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { currentPassword, newPassword } = parsed.data

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  // If user already has a password, require the current one
  if (user.passwordHash) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Senha atual é obrigatória" },
        { status: 400 }
      )
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 400 }
      )
    }
  }

  const newHash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  })

  return NextResponse.json({ ok: true })
}
