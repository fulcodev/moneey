import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ success: false }, { status: 400 })

  const secret = process.env.RECAPTCHA_SECRET_KEY!
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${token}`,
  })

  const data = await res.json()

  // reCAPTCHA v3 returns score 0.0–1.0. Reject bots (< 0.5)
  const success = data.success && (data.score >= 0.5)
  return NextResponse.json({ success, score: data.score })
}
