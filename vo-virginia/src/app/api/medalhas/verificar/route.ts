import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkMedals } from "@/lib/medal-checker"
import { MEDAL_DEFINITIONS } from "@/lib/medals"

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

    // Notify friends about new medals
    try {
      const friendships = await prisma.friendship.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { initiatorId: userId },
            { receiverId: userId },
          ],
        },
        select: { initiatorId: true, receiverId: true },
      })

      const friendIds = friendships.map((f) =>
        f.initiatorId === userId ? f.receiverId : f.initiatorId
      )

      if (friendIds.length > 0) {
        const notifications = newMedals.flatMap((m) => {
          const medalDef = MEDAL_DEFINITIONS.find((md) => md.id === m.medalId)
          return friendIds.map((friendId) => ({
            recipientId: friendId,
            senderId: userId,
            type: "FRIEND_MEDAL_EARNED",
            data: {
              friendName: session.user.name,
              medalName: medalDef?.name || m.medalId,
              medalLevel: m.level || "",
            },
            status: "APPROVED" as const,
          }))
        })

        await prisma.notification.createMany({ data: notifications })
      }
    } catch {
      // Don't fail medal check if notifications fail
    }
  }

  return NextResponse.json({ newMedals })
}
