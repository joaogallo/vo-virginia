import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resolveNotificationSchema } from "@/lib/validators"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { notificationId } = await params
  const body = await req.json()
  const parsed = resolveNotificationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { action } = parsed.data

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      sender: { select: { id: true, name: true } },
    },
  })

  if (!notification) {
    return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
  }

  if (notification.recipientId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  if (notification.status !== "PENDING") {
    return NextResponse.json({ error: "Notificação já foi resolvida" }, { status: 400 })
  }

  if (notification.type !== "PROFILE_CHANGE_REQUEST") {
    return NextResponse.json({ error: "Tipo de notificação inválido" }, { status: 400 })
  }

  const data = notification.data as { requestedName?: string; childCurrentName?: string }
  const requestedName = data.requestedName ?? ""
  const childId = notification.senderId

  const resolverName = session.user.name ?? "Responsável"

  if (action === "APPROVED") {
    await prisma.$transaction([
      // Update child's name
      prisma.user.update({
        where: { id: childId },
        data: { name: requestedName },
      }),
      // Mark this notification as approved
      prisma.notification.update({
        where: { id: notificationId },
        data: { status: "APPROVED", resolvedBy: session.user.id, readAt: new Date() },
      }),
      // Cancel other pending notifications for the same request
      prisma.notification.updateMany({
        where: {
          senderId: childId,
          type: "PROFILE_CHANGE_REQUEST",
          status: "PENDING",
          NOT: { id: notificationId },
        },
        data: { status: "CANCELLED" },
      }),
      // Notify the child
      prisma.notification.create({
        data: {
          recipientId: childId,
          senderId: session.user.id,
          type: "NAME_CHANGE_APPROVED",
          data: { newName: requestedName, approvedBy: resolverName },
          status: "APPROVED",
        },
      }),
    ])
  } else {
    await prisma.$transaction([
      // Mark this notification as rejected
      prisma.notification.update({
        where: { id: notificationId },
        data: { status: "REJECTED", resolvedBy: session.user.id, readAt: new Date() },
      }),
      // Notify the child
      prisma.notification.create({
        data: {
          recipientId: childId,
          senderId: session.user.id,
          type: "NAME_CHANGE_REJECTED",
          data: { requestedName, rejectedBy: resolverName },
          status: "REJECTED",
        },
      }),
    ])
  }

  return NextResponse.json({ success: true, action })
}
