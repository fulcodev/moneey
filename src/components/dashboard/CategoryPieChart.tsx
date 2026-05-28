'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface Slice {
  label: string
  value: number
  color: string
}

export function CategoryPieChart({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const filtered = data.filter((d) => d.value > 0)

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-body text-body">
        Sin datos de gastos
      </div>
    )
  }

  const formatVal = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', notation: 'compact' }).format(v)

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {filtered.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: unknown, name: unknown) => {
              const pct = ((Number(value) / total) * 100).toFixed(1)
              return [`${formatVal(Number(value))} (${pct}%)`, String(name)]
            }}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e2e2', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
        {filtered.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-body-sm text-body">{d.label}</span>
            <span className="text-body-sm-strong text-ink">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
