import { ExchangeRate } from '@/types'

const API_BASE = 'https://ve.dolarapi.com/v1'

let cachedRates: { oficial: number; paralelo: number } | null = null
let lastFetch = 0
const CACHE_TTL = 30 * 60 * 1000 // 30 min

export async function fetchRates(force = false): Promise<{ oficial: number; paralelo: number }> {
  const now = Date.now()
  if (!force && cachedRates && now - lastFetch < CACHE_TTL) {
    return cachedRates
  }

  const res = await fetch(`${API_BASE}/dolares`)
  if (!res.ok) throw new Error('Failed to fetch rates')

  const data: ExchangeRate[] = await res.json()
  const oficial = data.find((d) => d.fuente === 'oficial')?.promedio || 0
  const paralelo = data.find((d) => d.fuente === 'paralelo')?.promedio || 0

  cachedRates = { oficial, paralelo }
  lastFetch = now
  return cachedRates
}

export function getCachedRates() {
  return cachedRates
}
