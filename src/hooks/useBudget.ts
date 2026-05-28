'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { getDbInstance } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth'

export interface Budget {
  id: string
  categoryId: string
  categoryName: string
  limit: number
  spent: number
  month: string
  createdAt: string
  updatedAt: string
}

function userPath() { const u = getCurrentUser(); if (!u) throw new Error('No auth'); return `users/${u.uid}` }

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    const col = collection(getDbInstance(), `users/${user.uid}/budgets`)
    const q = query(col)
    const unsub = onSnapshot(q, (snap) => {
      setBudgets(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Budget)))
      setLoading(false)
    })
    return unsub
  }, [])

  const setBudget = useCallback(async (categoryId: string, categoryName: string, limit: number, month: string) => {
    const col = collection(getDbInstance(), `${userPath()}/budgets`)
    await addDoc(col, { categoryId, categoryName, limit, spent: 0, month, createdAt: Timestamp.now().toDate().toISOString(), updatedAt: Timestamp.now().toDate().toISOString() })
  }, [])

  const updateBudget = useCallback(async (id: string, data: Partial<Budget>) => {
    const ref = doc(getDbInstance(), `${userPath()}/budgets`, id)
    await updateDoc(ref, { ...data, updatedAt: Timestamp.now().toDate().toISOString() })
  }, [])

  const deleteBudget = useCallback(async (id: string) => {
    const ref = doc(getDbInstance(), `${userPath()}/budgets`, id)
    await deleteDoc(ref)
  }, [])

  return { budgets, loading, setBudget, updateBudget, deleteBudget }
}
