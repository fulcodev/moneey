import { Transaction } from '@/types'
import { safeSum, add, sub, roundMoney } from '@/lib/utils'

export interface MonthlyAggregate {
  yearMonth: string
  income: number
  expense: number
  balance: number
  count: number
}

export function computeMonthlyAggregate(transactions: Transaction[], yearMonth: string): MonthlyAggregate {
  const filtered = transactions.filter((t) => t.date.startsWith(yearMonth))
  const income = safeSum(filtered.filter((t) => t.type === 'income').map((t) => t.amount))
  const expense = safeSum(filtered.filter((t) => t.type === 'expense').map((t) => t.amount))
  return {
    yearMonth,
    income,
    expense,
    balance: sub(income, expense),
    count: filtered.length,
  }
}

export function computeAggregateRange(transactions: Transaction[], months: number): MonthlyAggregate[] {
  const result: MonthlyAggregate[] = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    result.push(computeMonthlyAggregate(transactions, ym))
  }
  return result
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  categoryIds: string[]
): Record<string, number> {
  const map: Record<string, number> = {}
  categoryIds.forEach((id) => { map[id] = 0 })
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      map[t.categoryId] = add(map[t.categoryId] || 0, t.amount)
    })
  return map
}
