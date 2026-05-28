'use client'

import { useState, useMemo } from 'react'
import { Transaction, RecurringPayment } from '@/types'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency } from '@/lib/utils'

interface Props {
  transactions: Transaction[]
  recurring: RecurringPayment[]
}

export function EstimationsPanel({ transactions, recurring }: Props) {
  const { categories } = useCategories()
  const [months, setMonths] = useState(3)

  const historicalAvg = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, 1).toISOString().split('T')[0]
    const recent = transactions.filter((t) => t.date >= cutoff && t.type === 'expense')

    const byCat: Record<string, number[]> = {}
    recent.forEach((t) => {
      if (!byCat[t.categoryId]) byCat[t.categoryId] = []
      byCat[t.categoryId].push(t.amount)
    })

    return Object.entries(byCat).map(([catId, amounts]) => ({
      categoryId: catId,
      categoryName: categories.find((c) => c.id === catId)?.name || 'Sin cat.',
      color: categories.find((c) => c.id === catId)?.color || '#8e8e93',
      average: amounts.reduce((s, a) => s + a, 0) / months,
      total: amounts.reduce((s, a) => s + a, 0),
      count: amounts.length,
    })).sort((a, b) => b.average - a.average)
  }, [transactions, categories, months])

  const recurringMonthly = useMemo(() => {
    return recurring.reduce((sum, r) => {
      if (!r.active) return sum
      if (r.frequency === 'monthly') return sum + r.amount
      if (r.frequency === 'biweekly') return sum + r.amount * 2
      if (r.frequency === 'weekly') return sum + r.amount * 4
      if (r.frequency === 'yearly') return sum + r.amount / 12
      return sum
    }, 0)
  }, [recurring])

  const totalEstimated = historicalAvg.reduce((s, c) => s + c.average, 0) + recurringMonthly

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {[1, 3, 6, 12].map((n) => (
            <button
              key={n}
              onClick={() => setMonths(n)}
              className={`px-3 py-1 rounded-pill text-body-sm transition-all ${
                months === n ? 'bg-primary text-on-primary' : 'bg-canvas text-ink border border-[#e2e2e2]'
              }`}
            >
              {n} {n === 1 ? 'mes' : 'meses'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-[#e2e2e2] bg-canvas p-4">
          <p className="text-body-sm text-body">Gasto mensual estimado</p>
          <p className="text-display-md text-ink">{formatCurrency(totalEstimated)}</p>
        </div>
        <div className="rounded-lg border border-[#e2e2e2] bg-canvas p-4">
          <p className="text-body-sm text-body">Recurrentes</p>
          <p className="text-display-md text-red-500">{formatCurrency(recurringMonthly)}</p>
        </div>
        <div className="rounded-lg border border-[#e2e2e2] bg-canvas p-4">
          <p className="text-body-sm text-body">Promedio histórico</p>
          <p className="text-display-md text-primary">{formatCurrency(historicalAvg.reduce((s, c) => s + c.average, 0))}</p>
        </div>
      </div>

      <div className="rounded-lg border border-[#e2e2e2] bg-canvas p-4">
        <h3 className="text-body-sm-strong text-ink mb-3">Desglose por categoría (promedio mensual)</h3>
        <div className="space-y-2">
          {historicalAvg.map((cat) => (
            <div key={cat.categoryId} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-ink truncate">{cat.categoryName}</span>
                  <span className="text-body-sm text-body">{formatCurrency(cat.average)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-canvas-soft overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min((cat.average / (totalEstimated || 1)) * 100, 100)}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
