'use client'

import { useState, useEffect, useCallback } from 'react'
import { Category, Transaction } from '@/types'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
  writeBatch, Timestamp, getDocs,
} from 'firebase/firestore'
import { getDbInstance } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth'
import { defaultCategories } from '@/data/defaultCategories'

function userPath() {
  const u = getCurrentUser()
  if (!u) throw new Error('No auth')
  return `users/${u.uid}`
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    const col = collection(getDbInstance(), `users/${user.uid}/categories`)
    const q = query(col, orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)))
      setLoading(false)
    })
    return unsub
  }, [])

  const seedDefaults = useCallback(async () => {
    const user = getCurrentUser()
    if (!user) return
    const db = getDbInstance()

    const colRef = collection(db, `${userPath()}/categories`)
    const existing = await getDocs(colRef)
    if (existing.docs.length > 0) return

    const batch = writeBatch(db)
    for (const cat of defaultCategories) {
      const ref = doc(colRef, cat.id)
      const data: Record<string, unknown> = {
        name: cat.name, type: cat.type, color: cat.color,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      }
      if (cat.type === 'expense') data.budget = 0
      batch.set(ref, data)
    }
    await batch.commit()
  }, [])

  const addCategory = useCallback(async (data: { name: string; type: 'income' | 'expense'; color?: string; budget?: number }) => {
    const col = collection(getDbInstance(), `${userPath()}/categories`)
    const docData: Record<string, unknown> = {
      name: data.name, type: data.type, color: data.color,
      createdAt: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString(),
    }
    if (data.budget !== undefined) docData.budget = data.budget
    await addDoc(col, docData)
  }, [])

  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    const ref = doc(getDbInstance(), `${userPath()}/categories`, id)
    await updateDoc(ref, { ...data, updatedAt: Timestamp.now().toDate().toISOString() })
  }, [])

  const deleteCategory = useCallback(async (id: string, transactions: Transaction[]) => {
    const inUse = transactions.some((t) => t.categoryId === id)
    if (inUse) {
      throw new Error('No podés borrar una categoría que tiene movimientos. Reasigná o borrá los movimientos primero.')
    }
    const ref = doc(getDbInstance(), `${userPath()}/categories`, id)
    await deleteDoc(ref)
  }, [])

  return { categories, loading, seedDefaults, addCategory, updateCategory, deleteCategory }
}

export async function getCategoriesSnapshot(): Promise<Category[]> {
  const user = getCurrentUser()
  if (!user) return []
  const snap = await getDocs(collection(getDbInstance(), `users/${user.uid}/categories`))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category))
}
