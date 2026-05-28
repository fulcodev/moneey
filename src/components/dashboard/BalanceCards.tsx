'use client'

import { formatCurrency } from '@/lib/utils'

interface Props {
  totalIncome: number
  totalExpenses: number
  balance: number
  periodLabel: string
}

export function BalanceCards({ totalIncome, totalExpenses, balance, periodLabel }: Props) {

  return (
    <div>
      <p className="text-body-sm text-body mb-3">{periodLabel}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Balance" value={formatCurrency(balance)} className={balance >= 0 ? 'text-ink' : 'text-red-500'} />
        <Card label="Ingresos" value={formatCurrency(totalIncome)} className="text-green-600" />
        <Card label="Gastos" value={formatCurrency(totalExpenses)} className="text-red-500" />
      </div>
    </div>
  )
}

function Card({ label, value, className = 'text-ink' }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl bg-canvas shadow-card p-6">
      <p className="text-body-sm text-body">{label}</p>
      <p className={`text-display-md mt-1 ${className}`}>{value}</p>
    </div>
  )
}
