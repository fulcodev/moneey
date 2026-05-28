'use client'

import { useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TransactionsTable } from '@/components/tables/TransactionsTable'
import { BudgetGauge } from '@/components/dashboard/BudgetGauge'
import { Category, Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

interface Props {
  category: Category
  transactions: Transaction[]
  onClose: () => void
}

export function CategoryDetailModal({ category, transactions, onClose }: Props) {
  const catTransactions = useMemo(
    () => transactions.filter((t) => t.categoryId === category.id),
    [transactions, category.id]
  )

  const stats = useMemo(() => {
    const income = catTransactions.filter((t) => t.type === 'income')
    const expense = catTransactions.filter((t) => t.type === 'expense')
    const totalExpense = expense.reduce((s, t) => s + t.amount, 0)
    const totalIncome = income.reduce((s, t) => s + t.amount, 0)
    return {
      totalExpense,
      totalIncome,
      count: catTransactions.length,
      average: catTransactions.length > 0
        ? catTransactions.reduce((s, t) => s + t.amount, 0) / catTransactions.length
        : 0,
    }
  }, [catTransactions])

  const monthlyTrend = useMemo(() => {
    const map: Record<string, number> = {}
    catTransactions
      .filter((t) => t.type === (category.type === 'expense' ? 'expense' : 'income'))
      .forEach((t) => {
        const m = t.date.substring(0, 7)
        map[m] = (map[m] || 0) + t.amount
      })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([label, amount]) => ({ label: label.substring(5), amount }))
  }, [catTransactions, category.type])

  const budgetPct = category.budget && category.budget > 0
    ? (stats.totalExpense / category.budget) * 100
    : 0

  const isExpense = category.type === 'expense'

  return (
    <Modal open onClose={onClose} title={category.name} wide>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="flex items-start gap-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.color || '#8e8e93' }}>
            <span className="text-on-dark text-display-sm">{isExpense ? '↓' : '↑'}</span>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-body-sm text-body">Total {isExpense ? 'gastado' : 'recibido'}</p>
              <p className={`text-display-sm ${isExpense ? 'text-red-500' : 'text-green-600'}`}>
                {formatCurrency(isExpense ? stats.totalExpense : stats.totalIncome)}
              </p>
            </div>
            <div>
              <p className="text-body-sm text-body">Transacciones</p>
              <p className="text-display-sm text-ink">{stats.count}</p>
            </div>
            <div>
              <p className="text-body-sm text-body">Promedio</p>
              <p className="text-display-sm text-ink">{formatCurrency(stats.average)}</p>
            </div>
            <div>
              <p className="text-body-sm text-body">Tipo</p>
              <p className="text-display-sm text-ink">{isExpense ? 'Gasto' : 'Ingreso'}</p>
            </div>
          </div>
        </div>

        {/* Budget Gauge */}
        {isExpense && category.budget && category.budget > 0 && (
          <div className="rounded-xl bg-canvas-soft p-4 flex items-center gap-6">
            <BudgetGauge percentage={budgetPct} color={category.color} size={90} strokeWidth={8} />
            <div>
              <p className="text-body-strong text-ink">Presupuesto</p>
              <p className="text-body-sm text-body mt-0.5">
                {formatCurrency(stats.totalExpense)} de {formatCurrency(category.budget)}
              </p>
              <p className={`text-body-sm mt-0.5 ${budgetPct >= 100 ? 'text-red-500' : budgetPct >= 80 ? 'text-orange-500' : 'text-green-600'}`}>
                {budgetPct >= 100
                  ? `Excedido por ${formatCurrency(stats.totalExpense - category.budget)}`
                  : `Restan ${formatCurrency(category.budget - stats.totalExpense)}`
                }
              </p>
            </div>
          </div>
        )}

        {/* Monthly Trend Mini Chart */}
        {monthlyTrend.length > 1 && (
          <div>
            <p className="text-body-strong text-ink mb-2">Tendencia mensual</p>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#afafaf' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: unknown, _n: unknown) => [formatCurrency(Number(v)), isExpense ? 'Gasto' : 'Ingreso']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e2e2' }}
                  />
                  <Bar dataKey="amount" fill={category.color || '#000'} radius={[3, 3, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transactions list */}
        <div>
          <p className="text-body-strong text-ink mb-3">Transacciones</p>
          {catTransactions.length === 0 ? (
            <p className="text-body text-body">Sin movimientos en esta categoría</p>
          ) : (
            <TransactionsTable
              transactions={catTransactions}
              categories={[category]}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}
