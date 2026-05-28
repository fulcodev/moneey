'use client'

import { useState, useEffect, useCallback } from 'react'
import { SavingsGoal } from '@/types'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp, getDoc, getDocs,
} from 'firebase/firestore'
import { getDbInstance } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth'
import { cleanData, roundMoney, add } from '@/lib/utils'
import { autoSaveFromIncome } from '@/lib/financial'

function userPath() {
  const u = getCurrentUser(); if (!u) throw new Error('No auth'); return `users/${u.uid}`
}

export function useGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    const col = collection(getDbInstance(), `users/${user.uid}/goals`)
    const q = query(col, orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setGoals(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavingsGoal)))
      setLoading(false)
    })
    return unsub
  }, [])

  const addGoal = useCallback(async (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const col = collection(getDbInstance(), `${userPath()}/goals`)
    await addDoc(col, cleanData({
      ...data,
      targetAmount: roundMoney(data.targetAmount),
      currentAmount: roundMoney(data.currentAmount),
      createdAt: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString(),
    }))
  }, [])

  const updateGoal = useCallback(async (id: string, data: Partial<SavingsGoal>) => {
    const ref = doc(getDbInstance(), `${userPath()}/goals`, id)
    const clean: Record<string, unknown> = { ...data, updatedAt: Timestamp.now().toDate().toISOString() }
    if (clean.targetAmount) clean.targetAmount = roundMoney(clean.targetAmount as number)
    if (clean.currentAmount) clean.currentAmount = roundMoney(clean.currentAmount as number)
    await updateDoc(ref, clean)
  }, [])

  const deleteGoal = useCallback(async (id: string) => {
    const ref = doc(getDbInstance(), `${userPath()}/goals`, id)
    await deleteDoc(ref)
  }, [])

  const addToGoal = useCallback(async (id: string, amount: number, createTransaction = true) => {
    const db = getDbInstance()
    const ref = doc(db, `${userPath()}/goals`, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return

    const goal = snap.data() as SavingsGoal
    const roundedAmount = roundMoney(amount)
    const newAmount = add(goal.currentAmount, roundedAmount)
    await updateDoc(ref, { currentAmount: newAmount, updatedAt: Timestamp.now().toDate().toISOString() })

    // Create linked transaction
    if (createTransaction) {
      const txsCol = collection(db, `${userPath()}/transactions`)
      await addDoc(txsCol, cleanData({
        type: 'expense' as const,
        amount: roundedAmount,
        currency: 'USD' as const,
        categoryId: 'savings',
        date: new Date().toISOString().split('T')[0],
        notes: `Ahorro para ${goal.name}`,
        linkedGoalId: id,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      }))
    }
  }, [])

  const processIncomeAutoSave = useCallback(async (incomeAmount: number) => {
    const db = getDbInstance()
    const col = collection(db, `${userPath()}/settings`)
    const settingsSnap = await getDocs(col)
    const settings = settingsSnap.docs.find((d) => d.id === 'autoSave')
    const autoSavePercent = settings?.data()?.percent || 0
    if (autoSavePercent <= 0) return

    const counts = autoSaveFromIncome(incomeAmount, goals, autoSavePercent)
    for (const item of counts) {
      await addToGoal(item.goalId, item.amount)
    }
    return counts
  }, [goals, addToGoal])

  return { goals, loading, addGoal, updateGoal, deleteGoal, addToGoal, processIncomeAutoSave }
}
