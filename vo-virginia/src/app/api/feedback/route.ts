import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { z } from "zod"
import { auth } from "@/lib/auth"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const feedbackSchema = z.object({
  type: z.enum(["sugestao", "bug", "elogio", "outro"]),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(2000),
})

const typeLabels: Record<string, string> = {
  sugestao: "Sugestão",
  bug: "Bug",
  elogio: "Elogio",
  outro: "Outro",
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = feedbackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { type, message } = parsed.data
  const userName = session.user.name || "Usuário"
  const userEmail = session.user.email || ""
  const typeLabel = typeLabels[type]

  try {
    await getResend().emails.send({
      from: "Contato Vó Virgínia <vo-virginia@habitushealth.com.br>",
      to: "vo-virginia@habitushealth.com.br",
      replyTo: userEmail,
      subject: `[Feedback - ${typeLabel}] de ${userName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Novo Feedback — Vó Virgínia</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #374151;">Tipo:</td>
              <td style="padding: 8px;">${typeLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #374151;">Usuário:</td>
              <td style="padding: 8px;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 8px;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #374151;">Data:</td>
              <td style="padding: 8px;">${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0; white-space: pre-wrap; color: #1f2937;">${message}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Erro ao enviar feedback. Tente novamente." },
      { status: 500 }
    )
  }
}
