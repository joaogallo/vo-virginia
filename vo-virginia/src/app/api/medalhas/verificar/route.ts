import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkMedals } from "@/lib/medal-checker"

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const userId = session.user.id
  const newMedals = await checkMedals(userId)

  if (newMedals.length > 0) {
    await prisma.userMedal.createMany({
      data: newMedals.map((m) => ({
        userId,
        medalId: m.medalId,
        level: m.level,
      })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json({ newMedals })
}
