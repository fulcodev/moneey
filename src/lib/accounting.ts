import { Transaction } from '@/types'
import { add, sub, safeSum } from '@/lib/utils'

export interface RunningBalanceEntry {
  date: string
  amount: number
  type: 'income' | 'expense'
  runningBalance: number
  categoryId: string
  id: string
}

export function computeRunningBalance(transactions: Transaction[]): RunningBalanceEntry[] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let balance = 0
  return sorted.map((t) => {
    balance = t.type === 'income' ? add(balance, t.amount) : sub(balance, t.amount)
    return {
      date: t.date,
      amount: t.amount,
      type: t.type,
      runningBalance: balance,
      categoryId: t.categoryId,
      id: t.id,
    }
  })
}

export interface BalanceVerification {
  totalIncome: number
  totalExpenses: number
  expectedBalance: number
  computedBalance: number
  difference: number
  isBalanced: boolean
}

export function verifyBalance(transactions: Transaction[]): BalanceVerification {
  const incomes = transactions.filter((t) => t.type === 'income')
  const expenses = transactions.filter((t) => t.type === 'expense')

  const totalIncome = safeSum(incomes.map((t) => t.amount))
  const totalExpenses = safeSum(expenses.map((t) => t.amount))
  const expectedBalance = sub(totalIncome, totalExpenses)

  const running = computeRunningBalance(transactions)
  const computedBalance = running.length > 0 ? running[running.length - 1].runningBalance : 0

  return {
    totalIncome,
    totalExpenses,
    expectedBalance,
    computedBalance,
    difference: sub(expectedBalance, computedBalance),
    isBalanced: expectedBalance === computedBalance,
  }
}
