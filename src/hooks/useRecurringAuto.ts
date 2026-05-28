'use client'

import { useCallback } from 'react'
import { collection, addDoc, query, where, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore'
import { getDbInstance } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth'
import { cleanData, roundMoney } from '@/lib/utils'

export function useRecurringAuto() {
  const user = getCurrentUser()

  const processRecurring = useCallback(async () => {
    if (!user) return
    const db = getDbInstance()
    const now = new Date()
    const today = now.getDate()
    const todayStr = now.toISOString().split('T')[0]
    const yearMonth = todayStr.substring(0, 7)
    const results: { name: string; amount: number }[] = []

    const recurringCol = collection(db, `users/${user.uid}/recurring`)
    const recurringSnap = await getDocs(recurringCol)

    for (const docSnap of recurringSnap.docs) {
      const rec = docSnap.data()
      if (!rec.active) continue
      if (rec.frequency !== 'monthly' && rec.frequency !== 'yearly') continue
      if (rec.dayOfMonth !== today) continue

      // Check if already auto-created this month
      const txsCol = collection(db, `users/${user.uid}/transactions`)
      const txsQ = query(txsCol, where('linkedRecurringId', '==', docSnap.id))
      const txsSnap = await getDocs(txsQ)
      const alreadyCreated = txsSnap.docs.some((d) => d.data().date?.startsWith(yearMonth))
      if (alreadyCreated) continue

      // Create transaction
      await addDoc(txsCol, cleanData({
        type: 'expense',
        amount: roundMoney(rec.amount),
        currency: 'USD',
        categoryId: rec.categoryId || 'other-expense',
        date: todayStr,
        notes: `${rec.name} — automático`,
        linkedRecurringId: docSnap.id,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      }))

      // Update lastNotified
      const ref = doc(db, `users/${user.uid}/recurring`, docSnap.id)
      await updateDoc(ref, { lastNotified: todayStr })

      results.push({ name: rec.name, amount: rec.amount })
    }

    return results
  }, [user])

  return { processRecurring }
}
