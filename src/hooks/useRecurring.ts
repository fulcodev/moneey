'use client'

import { useState, useEffect, useCallback } from 'react'
import { RecurringPayment } from '@/types'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { getDbInstance } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth'
import { cleanData } from '@/lib/utils'

function userPath() { const u = getCurrentUser(); if (!u) throw new Error('No auth'); return `users/${u.uid}` }

export function useRecurring() {
  const [payments, setPayments] = useState<RecurringPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    const col = collection(getDbInstance(), `users/${user.uid}/recurring`)
    const q = query(col, orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RecurringPayment)))
      setLoading(false)
    })
    return unsub
  }, [])

  const addRecurring = useCallback(async (data: Omit<RecurringPayment, 'id' | 'createdAt'>) => {
    const col = collection(getDbInstance(), `${userPath()}/recurring`)
    await addDoc(col, cleanData({ ...data, createdAt: Timestamp.now().toDate().toISOString() }))
  }, [])

  const updateRecurring = useCallback(async (id: string, data: Partial<RecurringPayment>) => {
    const ref = doc(getDbInstance(), `${userPath()}/recurring`, id)
    await updateDoc(ref, { ...data })
  }, [])

  const deleteRecurring = useCallback(async (id: string) => {
    const ref = doc(getDbInstance(), `${userPath()}/recurring`, id)
    await deleteDoc(ref)
  }, [])

  return { payments, loading, addRecurring, updateRecurring, deleteRecurring }
}
