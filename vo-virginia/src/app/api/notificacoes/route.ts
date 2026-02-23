import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  // Quick unread count for polling
  if (searchParams.get("unreadCount") === "true") {
    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: session.user.id,
        readAt: null,
        status: "PENDING",
      },
    })
    return NextResponse.json({ unreadCount })
  }

  // Full list
  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      sender: {
        select: { id: true, name: true, role: true },
      },
    },
  })

  return NextResponse.json({ notifications })
}
