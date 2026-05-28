import { roundMoney, add, sub, mul, div } from '@/lib/utils'
import { Debt, SavingsGoal, Transaction } from '@/types'

export interface PayoffProjection {
  monthsToPayoff: number
  totalInterest: number
  totalPaid: number
  monthlyPayment: number
}

export function projectPayoff(
  remainingAmount: number,
  apr: number,
  monthlyPayment: number
): PayoffProjection | null {
  if (remainingAmount <= 0 || monthlyPayment <= 0) return null
  if (apr === 0) {
    const months = Math.ceil(remainingAmount / monthlyPayment)
    return { monthsToPayoff: months, totalInterest: 0, totalPaid: remainingAmount, monthlyPayment }
  }

  const monthlyRate = apr / 100 / 12
  let balance = remainingAmount
  let totalInterest = 0
  let months = 0
  const maxMonths = 600 // 50 years safety limit

  while (balance > 0 && months < maxMonths) {
    const interest = roundMoney(balance * monthlyRate)
    let payment = Math.min(monthlyPayment, balance + interest)
    const principal = sub(payment, interest)
    balance = sub(balance, principal)
    totalInterest = add(totalInterest, interest)
    months++
    if (payment <= interest && balance > 0) {
      return null // Payment doesn't cover interest
    }
  }

  return {
    monthsToPayoff: months,
    totalInterest,
    totalPaid: add(remainingAmount, totalInterest),
    monthlyPayment,
  }
}

export function projectGoal(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number
): { monthsRemaining: number; completionDate: string } | null {
  if (targetAmount <= 0 || monthlyContribution <= 0) return null
  const remaining = sub(targetAmount, currentAmount)
  if (remaining <= 0) return { monthsRemaining: 0, completionDate: new Date().toISOString().split('T')[0] }

  const months = Math.ceil(div(remaining, monthlyContribution))
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return { monthsRemaining: months, completionDate: date.toISOString().split('T')[0] }
}

export function autoSaveFromIncome(
  incomeAmount: number,
  goals: SavingsGoal[],
  autoSavePercent: number
): { goalId: string; amount: number }[] {
  if (autoSavePercent <= 0 || goals.length === 0) return []
  const totalToSave = mul(incomeAmount, div(autoSavePercent, 100))
  const perGoal = div(totalToSave, goals.length)
  return goals.map((g) => ({ goalId: g.id, amount: perGoal }))
}
