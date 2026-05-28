import { NextRequest, NextResponse } from 'next/server'

// This runs on the client when the app loads + every hour
// It checks for upcoming recurring payments and triggers reminders

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const uid = searchParams.get('uid')
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/moneey-df341/databases/(default)/documents/users/${uid}/recurring?orderBy=name`,
      { headers: { Authorization: authHeader } }
    )

    if (!res.ok) return NextResponse.json({ error: 'Firestore error' }, { status: 500 })

    const data = await res.json()
    const documents = data.documents || []
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const reminders: { id: string; name: string; amount: number; days: number; dueDate: string; email: string }[] = []

    for (const doc of documents) {
      const fields = doc.fields || {}
      const active = fields.active?.booleanValue
      const notifyDays = fields.notifyDays?.integerValue
      const lastNotified = fields.lastNotified?.stringValue
      const dayOfMonth = fields.dayOfMonth?.integerValue
      const name = fields.name?.stringValue
      const amount = fields.amount?.doubleValue || fields.amount?.integerValue
      const email = fields.notifyEmail?.stringValue

      if (!active || !notifyDays || !dayOfMonth || !name || !email) continue

      const dueDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === notifyDays && lastNotified !== todayStr) {
        reminders.push({
          id: doc.name.split('/').pop() || '',
          name,
          amount: Number(amount),
          days: notifyDays,
          dueDate: dueDate.toISOString().split('T')[0],
          email,
        })
      }
    }

    return NextResponse.json({ reminders, checked: todayStr })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
