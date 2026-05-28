'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { MonthlyTrendChart } from '@/components/dashboard/MonthlyTrendChart'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { TransactionsTable } from '@/components/tables/TransactionsTable'
import { BudgetProgress } from '@/components/budgets/BudgetProgress'
import { EstimationsPanel } from '@/components/reports/EstimationsPanel'
import { getBiweeklyPeriod, getMonthPeriod, formatCurrency, add, sub, div, safeSum } from '@/lib/utils'
import { computeRunningBalance, verifyBalance } from '@/lib/accounting'
import { useBudgets } from '@/hooks/useBudget'
import { useBudgetAlerts } from '@/hooks/useBudgetAlerts'
import { useRecurring } from '@/hooks/useRecurring'
import { useRecurringAuto } from '@/hooks/useRecurringAuto'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { DashboardMetrics, MonthlyAggregate } from '@/types'
import { AlertTriangle } from 'lucide-react'
import { MetricSkeleton } from '@/components/ui/Skeleton'

export default function DashboardPage() {
  const { user } = useAuth()
  const { transactions, deleteTransaction } = useTransactions()
  const { categories, seedDefaults } = useCategories()
  const { budgets } = useBudgets()
  const { payments: recurring } = useRecurring()
  const { processRecurring } = useRecurringAuto()
  const [periodType, setPeriodType] = useState<'monthly' | 'biweekly'>('monthly')

  // Auto-create recurring transactions on mount
  useEffect(() => { processRecurring() }, [])

  useBudgetAlerts(transactions)
  useEffect(() => { seedDefaults() }, [seedDefaults])

  const periods = periodType === 'monthly'
    ? [getMonthPeriod(), getMonthPeriod(new Date(new Date().setMonth(new Date().getMonth() - 1)))]
    : [getBiweeklyPeriod(), getBiweeklyPeriod(new Date(new Date().setDate(new Date().getDate() - 15)))]

  const [activePeriod, setActivePeriod] = useState(periods[0])
  useEffect(() => { setActivePeriod(periods[0]) }, [periodType])

  const handlePeriodChange = (start: string, end: string) => {
    const match = periods.find((p) => p.start === start && p.end === end)
    if (match) setActivePeriod(match)
  }

  const filtered = useMemo(() =>
    transactions.filter((t) => t.date >= activePeriod.start && t.date <= activePeriod.end),
    [transactions, activePeriod]
  )

  const metrics: DashboardMetrics = useMemo(() => {
    const income = safeSum(filtered.filter((t) => t.type === 'income').map((t) => t.amount))
    const expense = safeSum(filtered.filter((t) => t.type === 'expense').map((t) => t.amount))
    const balance = sub(income, expense)
    const daysInPeriod = div(
      new Date(activePeriod.end).getTime() - new Date(activePeriod.start).getTime(),
      86400000
    ) + 1

    const byCat: Record<string, number> = {}
    filtered.filter((t) => t.type === 'expense').forEach((t) => {
      byCat[t.categoryId] = add(byCat[t.categoryId] || 0, t.amount)
    })
    let topCat = null
    if (Object.keys(byCat).length > 0) {
      const topId = Object.entries(byCat).sort(([, a], [, b]) => b - a)[0]
      const cat = categories.find((c) => c.id === topId[0])
      topCat = {
        name: cat?.name || 'Sin categoría',
        amount: topId[1],
        percentage: expense > 0 ? div(topId[1], expense) * 100 : 0,
      }
    }

    return {
      balance,
      totalIncome: income,
      totalExpenses: expense,
      savingsRate: income > 0 ? div(sub(income, expense), income) * 100 : 0,
      dailyAverage: daysInPeriod > 1 ? div(expense, Math.floor(daysInPeriod)) : expense,
      transactionCount: filtered.length,
      topCategory: topCat,
    }
  }, [filtered, categories, activePeriod])

  const monthlyTrend: MonthlyAggregate[] = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
      const p = getMonthPeriod(d)
      const txs = transactions.filter((t) => t.date >= p.start && t.date <= p.end)
      const income = safeSum(txs.filter((t) => t.type === 'income').map((t) => t.amount))
      const expense = safeSum(txs.filter((t) => t.type === 'expense').map((t) => t.amount))
      return { label: p.label.substring(0, 3), income, expense, balance: sub(income, expense), transactionCount: txs.length }
    })
  }, [transactions])

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    filtered.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.categoryId] = add(map[t.categoryId] || 0, t.amount)
    })
    return Object.entries(map).map(([catId, value]) => {
      const cat = categories.find((c) => c.id === catId)
      return { label: cat?.name || 'Sin cat.', value, color: cat?.color || '#8e8e93' }
    }).sort((a, b) => b.value - a.value)
  }, [filtered, categories])

  const monthlySpending: Record<string, number> = {}
  transactions.forEach((t) => {
    if (t.type === 'expense') monthlySpending[t.categoryId] = add(monthlySpending[t.categoryId] || 0, t.amount)
  })

  const recentTransactions = filtered.slice(0, 5)
  const emailPart = user?.email?.split('@')[0] || ''

  // Balance verification
  const verification = useMemo(() => verifyBalance(transactions), [transactions])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg text-ink">Dashboard</h1>
          <p className="text-body text-body mt-1">Bienvenido, {emailPart}</p>
        </div>
        <Link href="/dashboard/transactions"><Button variant="primary">+ Nuevo movimiento</Button></Link>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <PeriodSelector periods={periods} active={activePeriod} onChange={handlePeriodChange} />
        <select value={periodType} onChange={(e) => setPeriodType(e.target.value as 'monthly' | 'biweekly')}
          className="h-[36px] rounded-pill border border-[#e2e2e2] bg-canvas px-4 text-body-sm text-ink focus:outline-none"
        >
          <option value="monthly">Mensual</option>
          <option value="biweekly">Quincenal</option>
        </select>
      </div>

      <MetricCards metrics={metrics} periodLabel={activePeriod.label} />

      {/* Principal gasto */}
      {!verification.isBalanced && (verification.totalIncome > 0 || verification.totalExpenses > 0) && (
        <div className="rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-orange-500 shrink-0" />
          <p className="text-body-sm text-orange-700 dark:text-orange-400">
            Diferencia contable detectada: {formatCurrency(verification.difference)}. Los datos pueden ser inconsistentes.
          </p>
        </div>
      )}

      {metrics.topCategory && (
        <div className="rounded-xl bg-primary text-on-dark p-4 flex items-center justify-between">
          <div>
            <p className="text-body-sm text-white/70">Principal gasto</p>
            <p className="text-display-sm text-on-dark mt-0.5">{metrics.topCategory.name}</p>
          </div>
          <div className="text-right">
            <p className="text-display-sm text-on-dark">{formatCurrency(metrics.topCategory.amount)}</p>
            <p className="text-body-sm text-white/70">{metrics.topCategory.percentage.toFixed(0)}% del total</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-canvas shadow-card p-5">
          <p className="text-body-strong text-ink mb-3">Ingresos vs Gastos</p>
          <IncomeExpenseChart data={monthlyTrend} />
        </div>
        <div className="rounded-xl bg-canvas shadow-card p-5">
          <p className="text-body-strong text-ink mb-3">Evolución del balance</p>
          <MonthlyTrendChart data={monthlyTrend.map((m) => ({ label: m.label, balance: m.balance }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-canvas shadow-card p-5">
          <p className="text-body-strong text-ink mb-3">Gastos por categoría</p>
          <CategoryPieChart data={categoryBreakdown} />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl bg-canvas shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-body-strong text-ink">Presupuestos</p>
              <Link href="/dashboard/budgets" className="text-body-sm text-primary hover:underline">Ver todos</Link>
            </div>
            {budgets.length === 0 ? (
              <p className="text-body text-body">Sin presupuestos activos</p>
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 3).map((b) => (
                  <BudgetProgress
                    key={b.id}
                    categoryName={b.categoryName}
                    limit={b.limit}
                    spent={monthlySpending[b.categoryId] || 0}
                    color={categories.find((c) => c.id === b.categoryId)?.color}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-canvas shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-body-strong text-ink">Últimos movimientos</p>
          <Link href="/dashboard/transactions" className="text-body-sm text-primary hover:underline">Ver todos</Link>
        </div>
        <TransactionsTable transactions={recentTransactions} categories={categories} onEdit={() => {}} onDelete={deleteTransaction} />
      </div>

      <div className="rounded-xl bg-canvas shadow-card p-5">
        <p className="text-body-strong text-ink mb-3">Estimación mensual</p>
        <EstimationsPanel transactions={transactions} recurring={recurring} />
      </div>
    </div>
  )
}
