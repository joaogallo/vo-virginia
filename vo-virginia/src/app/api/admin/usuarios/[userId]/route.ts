import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminEditUserSchema } from "@/lib/validators"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { userId } = await params
  const body = await req.json()
  const parsed = adminEditUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  if (!target) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  // If changing name, cancel any pending name change requests for this user
  if (parsed.data.name) {
    await prisma.notification.updateMany({
      where: {
        senderId: userId,
        type: "PROFILE_CHANGE_REQUEST",
        status: "PENDING",
      },
      data: { status: "CANCELLED" },
    })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(updated)
}
