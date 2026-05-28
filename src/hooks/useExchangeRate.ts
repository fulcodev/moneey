'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchRates } from '@/lib/rates'
import { collection, addDoc, query, orderBy, getDocs, Timestamp, onSnapshot } from 'firebase/firestore'
import { getDbInstance } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth'
import { ExchangeRateSnapshot } from '@/types'

export function useExchangeRate() {
  const [oficial, setOficial] = useState(0)
  const [paralelo, setParalelo] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const rates = await fetchRates(true)
      setOficial(rates.oficial)
      setParalelo(rates.paralelo)
      setLastUpdate(new Date().toISOString())

      // Snapshot to Firestore
      const user = getCurrentUser()
      if (user && rates.oficial > 0) {
        const today = new Date().toISOString().split('T')[0]
        const col = collection(getDbInstance(), `users/${user.uid}/exchangeRates`)
        const q = query(col, orderBy('date', 'desc'))
        const snap = await getDocs(q)
        const exists = snap.docs.find((d) => d.data().date === today)
        if (!exists) {
          await addDoc(col, {
            date: today,
            oficial: rates.oficial,
            paralelo: rates.paralelo,
            createdAt: Timestamp.now().toDate().toISOString(),
          })
        }
      }
    } catch {
      // silent fail — keep previous rate
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch + periodic refresh
  useEffect(() => {
    const initial = async () => {
      try {
        const rates = await fetchRates()
        setOficial(rates.oficial)
        setParalelo(rates.paralelo)
        setLastUpdate(new Date().toISOString())
      } catch { /* use defaults */ }
      setLoading(false)
    }
    initial()

    // Re-fetch on visibility change
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVisible)

    // Re-fetch every 30 min
    const interval = setInterval(refresh, 30 * 60 * 1000)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(interval)
    }
  }, [refresh])

  const getRateForDate = useCallback(async (date: string): Promise<number> => {
    // Try to find the rate for a specific date from Firestore
    const user = getCurrentUser()
    if (!user) return oficial
    const col = collection(getDbInstance(), `users/${user.uid}/exchangeRates`)
    const q = query(col, orderBy('date', 'desc'))
    const snap = await getDocs(q)
    const match = snap.docs.find((d) => d.data().date === date)
    if (match) return match.data().oficial
    // Fallback to current rate
    return oficial
  }, [oficial])

  return {
    oficial,
    paralelo,
    loading,
    lastUpdate,
    refresh,
    getRateForDate,
  }
}
