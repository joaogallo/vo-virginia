import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createSessionSchema } from "@/lib/validators"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { operations, numbers, totalQuestions: clientTotal } = parsed.data

  // Usar total do cliente se fornecido, senão calcular
  let totalQuestions = clientTotal ?? 0
  if (!clientTotal) {
    for (const op of operations) {
      for (const x of numbers) {
        for (let y = 0; y <= 10; y++) {
          if (op === "DIVISION" && x === 0) continue
          totalQuestions++
        }
      }
    }
  }

  const gameSession = await prisma.gameSession.create({
    data: {
      userId: session.user.id,
      operations,
      numbers,
      totalQuestions,
    },
  })

  return NextResponse.json(gameSession, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const skip = (page - 1) * limit

  const [sessions, total] = await Promise.all([
    prisma.gameSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.gameSession.count({
      where: { userId: session.user.id },
    }),
  ])

  return NextResponse.json({ sessions, total, page })
}
