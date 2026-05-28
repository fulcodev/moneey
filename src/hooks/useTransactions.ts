'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Transaction } from '@/types'
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp, getDocs, getDoc, where, startAfter,
} from 'firebase/firestore'
import { getDbInstance } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth'
import { cleanData, roundMoney, safeSum } from '@/lib/utils'

const PAGE_SIZE = 50

function userPath() {
  const u = getCurrentUser()
  if (!u) throw new Error('No auth')
  return `users/${u.uid}`
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const lastDocRef = useRef<unknown>(null)
  const loadingMoreRef = useRef(false)

  // Initial load + real-time for recent
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return

    const col = collection(getDbInstance(), `users/${user.uid}/transactions`)
    const q = query(col, orderBy('date', 'desc'), limit(PAGE_SIZE))

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
      lastDocRef.current = docs[docs.length - 1]
      setHasMore(docs.length >= PAGE_SIZE)
      setTransactions(docs.map((d) => ({ id: d.id, ...d.data() } as Transaction)))
      setLoading(false)
    })
    return unsub
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !lastDocRef.current) return
    loadingMoreRef.current = true

    const user = getCurrentUser()
    if (!user) return

    const col = collection(getDbInstance(), `users/${user.uid}/transactions`)
    const q = query(col, orderBy('date', 'desc'), startAfter(lastDocRef.current), limit(PAGE_SIZE))
    const snap = await getDocs(q)

    if (snap.docs.length < PAGE_SIZE) setHasMore(false)
    if (snap.docs.length > 0) {
      lastDocRef.current = snap.docs[snap.docs.length - 1]
      setTransactions((prev) => [...prev, ...snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction))])
    }
    loadingMoreRef.current = false
  }, [])

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const col = collection(getDbInstance(), `${userPath()}/transactions`)
    await addDoc(col, cleanData({
      ...data,
      amount: roundMoney(data.amount),
      amountVES: data.amountVES ? roundMoney(data.amountVES) : undefined,
      createdAt: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString(),
    }))
  }, [])

  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    const ref = doc(getDbInstance(), `${userPath()}/transactions`, id)
    const clean: Record<string, unknown> = { ...data, updatedAt: Timestamp.now().toDate().toISOString() }
    if (clean.amount) clean.amount = roundMoney(clean.amount as number)
    if (clean.amountVES) clean.amountVES = roundMoney(clean.amountVES as number)
    await updateDoc(ref, clean)
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    const ref = doc(getDbInstance(), `${userPath()}/transactions`, id)
    await deleteDoc(ref)
  }, [])

  const getTransaction = useCallback(async (id: string): Promise<Transaction | null> => {
    const ref = doc(getDbInstance(), `${userPath()}/transactions`, id)
    const snap = await getDoc(ref)
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Transaction) : null
  }, [])

  return {
    transactions, loading, hasMore, loadMore,
    addTransaction, updateTransaction, deleteTransaction, getTransaction,
  }
}

export async function getTransactionsByPeriod(startDate: string, endDate: string): Promise<Transaction[]> {
  const user = getCurrentUser()
  if (!user) return []
  const col = collection(getDbInstance(), `users/${user.uid}/transactions`)
  const q = query(col, where('date', '>=', startDate), where('date', '<=', endDate), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction))
}
