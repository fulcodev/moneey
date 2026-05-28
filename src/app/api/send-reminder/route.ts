import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_QGGP9JjE_PnMa5JZCiKUvCaSEJseEMrLn'

interface Body {
  to: string
  name: string
  amount: number
  days: number
  dueDate: string
}

export async function POST(req: NextRequest) {
  const { to, name, amount, days, dueDate } = await req.json() as Body

  if (!to || !name) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Moneey <notificaciones@moneey.app>',
      to: [to],
      subject: `🔔 Recordatorio: ${name} vence en ${days} días`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 8px;">Moneey</h2>
          <p style="color: #5e5e5e; font-size: 16px; line-height: 24px;">
            Te recordamos que el pago recurrente de <strong>${name}</strong>
            por <strong>$${amount.toFixed(2)} USD</strong> vence el <strong>${dueDate}</strong>.
          </p>
          <p style="color: #5e5e5e; font-size: 14px; margin-top: 24px;">
            Saludos,<br/>Moneey — Tu app de finanzas personales
          </p>
        </div>
      `,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: data }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
