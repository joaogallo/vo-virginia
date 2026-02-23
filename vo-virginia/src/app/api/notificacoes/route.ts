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
    // Count actionable notifications (PENDING status) + informational unread (readAt null)
    const actionableTypes = ["PROFILE_CHANGE_REQUEST", "FRIEND_CHALLENGE_INVITE"]
    const [actionableCount, informationalCount] = await Promise.all([
      prisma.notification.count({
        where: {
          recipientId: session.user.id,
          readAt: null,
          status: "PENDING",
          type: { in: actionableTypes },
        },
      }),
      prisma.notification.count({
        where: {
          recipientId: session.user.id,
          readAt: null,
          type: { notIn: actionableTypes },
        },
      }),
    ])
    return NextResponse.json({ unreadCount: actionableCount + informationalCount })
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

  // Mark informational notifications as read when fetched
  const informationalIds = notifications
    .filter((n) => !["PROFILE_CHANGE_REQUEST", "FRIEND_CHALLENGE_INVITE"].includes(n.type) && !n.readAt)
    .map((n) => n.id)

  if (informationalIds.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: informationalIds } },
      data: { readAt: new Date() },
    })
  }

  return NextResponse.json({ notifications })
}
