'use client'

import { formatCurrency } from '@/lib/utils'
import { DashboardMetrics } from '@/types'

interface Props {
  metrics: DashboardMetrics
  periodLabel: string
}

export function MetricCards({ metrics, periodLabel }: Props) {

  const cards = [
    {
      label: 'Balance',
      value: formatCurrency(metrics.balance),
      className: metrics.balance >= 0 ? 'text-ink' : 'text-red-500',
      subtitle: periodLabel,
    },
    { label: 'Ingresos', value: formatCurrency(metrics.totalIncome), className: 'text-green-600' },
    { label: 'Gastos', value: formatCurrency(metrics.totalExpenses), className: 'text-red-500' },
    {
      label: 'Tasa de ahorro',
      value: metrics.totalIncome > 0
        ? `${((metrics.totalIncome - metrics.totalExpenses) / metrics.totalIncome * 100).toFixed(1)}%`
        : '—',
      className: metrics.totalIncome > metrics.totalExpenses ? 'text-green-600' : 'text-red-500',
    },
    { label: 'Promedio diario', value: formatCurrency(metrics.dailyAverage), className: 'text-body' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl bg-canvas shadow-card p-4">
          <p className="text-body-sm text-body">{card.label}</p>
          <p className={`text-display-sm mt-0.5 ${card.className}`}>{card.value}</p>
          {card.subtitle && <p className="text-body-sm text-mute mt-0.5">{card.subtitle}</p>}
        </div>
      ))}
    </div>
  )
}
