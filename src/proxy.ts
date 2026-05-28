import { NextResponse, NextRequest } from 'next/server'

const rateMap = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60_000
const MAX = 30

export function proxy(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'

  const now = Date.now()
  const entry = rateMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }

  entry.count++

  if (entry.count > MAX) {
    return new NextResponse('Too many requests', { status: 429 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/login', '/register'],
}
