import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const pending = await prisma.notification.findFirst({
    where: {
      senderId: session.user.id,
      type: "PROFILE_CHANGE_REQUEST",
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, data: true, createdAt: true },
  })

  if (!pending) {
    return NextResponse.json({ pendingNameChange: null })
  }

  const data = pending.data as { requestedName?: string }
  return NextResponse.json({
    pendingNameChange: {
      id: pending.id,
      requestedName: data.requestedName ?? "",
      createdAt: pending.createdAt,
    },
  })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  await prisma.notification.updateMany({
    where: {
      senderId: session.user.id,
      type: "PROFILE_CHANGE_REQUEST",
      status: "PENDING",
    },
    data: { status: "CANCELLED" },
  })

  return NextResponse.json({ success: true })
}
