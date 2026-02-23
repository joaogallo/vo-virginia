import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateFriendCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { friendCode: true },
  })

  if (user?.friendCode) {
    return NextResponse.json({ friendCode: user.friendCode })
  }

  // Generate unique code with retry
  let code: string
  let attempts = 0
  do {
    code = generateFriendCode()
    const existing = await prisma.user.findFirst({ where: { friendCode: code } })
    if (!existing) break
    attempts++
  } while (attempts < 10)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { friendCode: code },
  })

  return NextResponse.json({ friendCode: code })
}
