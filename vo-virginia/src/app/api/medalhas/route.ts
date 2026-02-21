import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const medals = await prisma.userMedal.findMany({
    where: { userId: session.user.id },
    orderBy: { unlockedAt: "desc" },
  })

  return NextResponse.json({ medals })
}
