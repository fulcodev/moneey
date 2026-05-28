'use client'

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

interface TrendData {
  label: string
  balance: number
}

export function MonthlyTrendChart({ data }: { data: TrendData[] }) {
  if (data.length === 0) return null

  const formatVal = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', notation: 'compact' }).format(v)

  const minBalance = Math.min(...data.map((d) => d.balance))
  const allPositive = minBalance >= 0

  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={allPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
            <stop offset="95%" stopColor={allPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#efefef" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#5e5e5e' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatVal} tick={{ fontSize: 11, fill: '#afafaf' }} axisLine={false} tickLine={false} width={60} />
        <Tooltip
          formatter={(value: unknown, _name: unknown) => [formatVal(Number(value)), 'Balance']}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e2e2', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke={allPositive ? '#22c55e' : '#ef4444'}
          fill="url(#balanceGrad)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: allPositive ? '#22c55e' : '#ef4444', strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
