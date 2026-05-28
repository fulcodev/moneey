'use client'

import { useState, useEffect, useCallback } from 'react'
import { Transaction } from '@/types'
import { useCategories } from '@/hooks/useCategories'
import { useToast } from '@/components/toast/ToastProvider'

interface Props {
  transactions: Transaction[]
}

export function useBudgetAlerts(transactions: Transaction[]) {
  const { categories } = useCategories()
  const { toast } = useToast()
  const [notified, setNotified] = useState<Set<string>>(new Set())

  useEffect(() => {
    const expenseCategories = categories.filter(
      (c) => c.type === 'expense' && c.budget && c.budget > 0
    )

    for (const cat of expenseCategories) {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((s, t) => s + t.amount, 0)

      const pct = (spent / cat.budget!) * 100
      const key = `${cat.id}:${Math.floor(pct / 10) * 10}`

      if (pct >= 100 && !notified.has(`${cat.id}:100`)) {
        toast(`${cat.name}: presupuesto EXCEDIDO`, 'error')
        setNotified((prev) => new Set(prev).add(`${cat.id}:100`))
      } else if (pct >= 80 && !notified.has(`${cat.id}:80`)) {
        toast(`${cat.name}: gastaste el ${pct.toFixed(0)}% del presupuesto`, 'warning')
        setNotified((prev) => new Set(prev).add(`${cat.id}:80`))
      }
    }
  }, [transactions, categories, toast, notified])

  return { notified }
}
