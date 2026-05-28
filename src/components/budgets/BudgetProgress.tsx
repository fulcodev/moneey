'use client'

interface Props {
  categoryName: string
  limit: number
  spent: number
  color?: string
}

export function BudgetProgress({ categoryName, limit, spent, color }: Props) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const remaining = limit - spent
  const isOver = remaining < 0
  const isWarning = pct >= 80 && pct < 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {color && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />}
          <span className="text-body text-ink">{categoryName}</span>
        </div>
        <span className="text-body-sm text-body">
          {formatSpent(spent)} / {formatSpent(limit)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-canvas-soft overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOver ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-primary'
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className={`text-body-sm ${isOver ? 'text-red-500' : 'text-body'}`}>
        {isOver
          ? `Excedido por ${formatSpent(-remaining)}`
          : `Restan ${formatSpent(remaining)}`}
      </p>
    </div>
  )
}

function formatSpent(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
}
