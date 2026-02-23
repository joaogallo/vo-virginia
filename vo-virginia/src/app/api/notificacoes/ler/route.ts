import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const notificationIds = body.notificationIds as string[] | undefined

  const where = notificationIds
    ? { id: { in: notificationIds }, recipientId: session.user.id, readAt: null }
    : { recipientId: session.user.id, readAt: null }

  await prisma.notification.updateMany({
    where,
    data: { readAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
