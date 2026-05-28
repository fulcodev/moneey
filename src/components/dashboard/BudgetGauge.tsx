'use client'

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'

interface Props {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}

export function BudgetGauge({ percentage, size = 100, strokeWidth = 10, color }: Props) {
  const pct = Math.min(percentage, 100)
  const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f97316' : color || '#000000'

  const data = [{ name: 'progress', value: pct, fill: barColor }]

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          barSize={strokeWidth}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={strokeWidth / 2} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-body-strong text-ink">{pct.toFixed(0)}%</span>
      </div>
    </div>
  )
}
