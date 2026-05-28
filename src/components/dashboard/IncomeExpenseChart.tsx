'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'

interface BarData {
  label: string
  income: number
  expense: number
}

export function IncomeExpenseChart({ data }: { data: BarData[] }) {
  if (data.length === 0) return null

  const formatVal = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', notation: 'compact' }).format(v)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#efefef" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#5e5e5e' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatVal} tick={{ fontSize: 11, fill: '#afafaf' }} axisLine={false} tickLine={false} width={60} />
        <Tooltip
          formatter={(value: unknown, _name: unknown) => [formatVal(Number(value)), '']}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e2e2', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
        />
        <Legend
          iconType="circle"
          formatter={(v: unknown) => <span className="text-body-sm text-ink">{v === 'income' ? 'Ingresos' : 'Gastos'}</span>}
        />
        <Bar dataKey="income" name="income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
