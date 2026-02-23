import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateProfileSchema } from "@/lib/validators"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      maxRetries: true,
      defaultQuestionLimit: true,
      linkCode: true,
      createdAt: true,
      passwordHash: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  const { passwordHash, ...rest } = user
  return NextResponse.json({ ...rest, hasPassword: !!passwordHash })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, ...settingsData } = parsed.data

  // Always update settings directly (maxRetries, defaultQuestionLimit)
  if (Object.keys(settingsData).length > 0) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: settingsData,
    })
  }

  // Handle name change
  if (name) {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Non-CHILD roles: update directly
    if (currentUser.role !== "CHILD") {
      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
        select: { id: true, name: true, email: true, role: true, maxRetries: true, defaultQuestionLimit: true },
      })
      return NextResponse.json(updated)
    }

    // CHILD: check for linked adults
    const linkedAdults = await prisma.parentChild.findMany({
      where: { childId: session.user.id },
      select: { parentId: true },
    })

    if (linkedAdults.length === 0) {
      // No linked adults: update directly
      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
        select: { id: true, name: true, email: true, role: true, maxRetries: true, defaultQuestionLimit: true },
      })
      return NextResponse.json(updated)
    }

    // Has linked adults: create approval request
    // Cancel any previous pending requests
    await prisma.notification.updateMany({
      where: {
        senderId: session.user.id,
        type: "PROFILE_CHANGE_REQUEST",
        status: "PENDING",
      },
      data: { status: "CANCELLED" },
    })

    // Create one notification per linked adult
    await prisma.notification.createMany({
      data: linkedAdults.map((link) => ({
        recipientId: link.parentId,
        senderId: session.user.id,
        type: "PROFILE_CHANGE_REQUEST",
        data: { requestedName: name, childCurrentName: currentUser.name },
        status: "PENDING" as const,
      })),
    })

    return NextResponse.json({
      pendingApproval: true,
      message: "Solicitação enviada para aprovação!",
    })
  }

  // If only settings were updated (no name), return updated profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, maxRetries: true, defaultQuestionLimit: true },
  })
  return NextResponse.json(user)
}
