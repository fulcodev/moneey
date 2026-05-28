'use client'

import { useState, useEffect, useCallback } from 'react'
import { Debt, DebtPayment } from '@/types'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, where,
  Timestamp, getDocs, getDoc,
} from 'firebase/firestore'
import { getDbInstance } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth'
import { cleanData, roundMoney, sub } from '@/lib/utils'

function userPath() {
  const u = getCurrentUser(); if (!u) throw new Error('No auth'); return `users/${u.uid}`
}

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    const col = collection(getDbInstance(), `users/${user.uid}/debts`)
    const q = query(col, orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setDebts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Debt)))
      setLoading(false)
    })
    return unsub
  }, [])

  const addDebt = useCallback(async (data: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const col = collection(getDbInstance(), `${userPath()}/debts`)
    await addDoc(col, cleanData({
      ...data,
      totalAmount: roundMoney(data.totalAmount),
      remainingAmount: roundMoney(data.remainingAmount),
      createdAt: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString(),
    }))
  }, [])

  const updateDebt = useCallback(async (id: string, data: Partial<Debt>) => {
    const ref = doc(getDbInstance(), `${userPath()}/debts`, id)
    const clean: Record<string, unknown> = { ...data, updatedAt: Timestamp.now().toDate().toISOString() }
    if (clean.totalAmount) clean.totalAmount = roundMoney(clean.totalAmount as number)
    if (clean.remainingAmount) clean.remainingAmount = roundMoney(clean.remainingAmount as number)
    await updateDoc(ref, clean)
  }, [])

  const deleteDebt = useCallback(async (id: string) => {
    const db = getDbInstance()
    const ref = doc(db, `${userPath()}/debts`, id)
    await deleteDoc(ref)
    const paymentsSnap = await getDocs(query(collection(db, `${userPath()}/debtPayments`), where('debtId', '==', id)))
    paymentsSnap.docs.forEach((d) => deleteDoc(d.ref))
  }, [])

  return { debts, loading, addDebt, updateDebt, deleteDebt }
}

export function useDebtPayments(debtId: string, debtName: string) {
  const [payments, setPayments] = useState<DebtPayment[]>([])
  const user = getCurrentUser()

  useEffect(() => {
    if (!user) return
    const col = collection(getDbInstance(), `users/${user.uid}/debtPayments`)
    const q = query(col, where('debtId', '==', debtId), orderBy('date', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as DebtPayment)))
    })
    return unsub
  }, [debtId])

  const addPayment = useCallback(async (data: Omit<DebtPayment, 'id' | 'createdAt'>, createTransaction = true) => {
    const db = getDbInstance()
    const uid = user?.uid
    if (!uid) return

    const roundedAmount = roundMoney(data.amount)

    // 1. Create debt payment
    const col = collection(db, `${userPath()}/debtPayments`)
    const paymentRef = await addDoc(col, { ...data, amount: roundedAmount, createdAt: Timestamp.now().toDate().toISOString() })

    // 2. Update debt remaining amount
    const debtRef = doc(db, `${userPath()}/debts`, debtId)
    const debtSnap = await getDoc(debtRef)
    if (debtSnap.exists()) {
      const debt = debtSnap.data() as Debt
      const newRemaining = Math.max(0, sub(debt.remainingAmount, roundedAmount))
      await updateDoc(debtRef, { remainingAmount: newRemaining, updatedAt: Timestamp.now().toDate().toISOString() })
    }

    // 3. Create linked transaction
    if (createTransaction) {
      const txsCol = collection(db, `${userPath()}/transactions`)
      await addDoc(txsCol, cleanData({
        type: 'expense' as const,
        amount: roundedAmount,
        currency: 'USD' as const,
        categoryId: 'debts-payment',
        date: data.date,
        notes: `Pago a ${debtName}${data.notes ? ` — ${data.notes}` : ''}`,
        linkedDebtId: debtId,
        linkedDebtPaymentId: paymentRef.id,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      }))
    }
  }, [debtId, debtName])

  const deletePayment = useCallback(async (paymentId: string, amount: number) => {
    const db = getDbInstance()
    const ref = doc(db, `${userPath()}/debtPayments`, paymentId)
    await deleteDoc(ref)
    const debtRef = doc(db, `${userPath()}/debts`, debtId)
    const debtSnap = await getDoc(debtRef)
    if (debtSnap.exists()) {
      const debt = debtSnap.data() as Debt
      await updateDoc(debtRef, { remainingAmount: roundMoney(debt.remainingAmount + amount), updatedAt: Timestamp.now().toDate().toISOString() })
    }
  }, [debtId])

  return { payments, addPayment, deletePayment }
}
