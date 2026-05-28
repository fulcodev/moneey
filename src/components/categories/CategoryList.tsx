'use client'

import { Category } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  categories: Category[]
  spendingByCategory?: Record<string, number>
  onEdit: (cat: Category) => void
  onDelete: (id: string) => void
}

export function CategoryList({ categories, spendingByCategory = {}, onEdit, onDelete }: Props) {
  const expenses = categories.filter((c) => c.type === 'expense')
  const incomes = categories.filter((c) => c.type === 'income')

  return (
    <div className="space-y-8">
      <Section title="Gastos" categories={expenses} spendingByCategory={spendingByCategory} onEdit={onEdit} onDelete={onDelete} />
      <Section title="Ingresos" categories={incomes} spendingByCategory={spendingByCategory} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

function Section({ title, categories, spendingByCategory = {}, onEdit, onDelete }: Props & { title: string }) {
  return (
    <div>
      <h3 className="text-body-sm-strong text-body mb-3 uppercase tracking-wider">{title}</h3>
      {categories.length === 0 ? (
        <p className="text-body text-body">Sin categorías</p>
      ) : (
        <div className="space-y-1">
          {categories.map((cat) => {
            const spent = spendingByCategory[cat.id] || 0
            const pct = cat.budget && cat.budget > 0 ? Math.min((spent / cat.budget) * 100, 100) : 0

            return (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-canvas border border-[#e2e2e2] group">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#8e8e93' }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-body text-ink">{cat.name}</p>
                    <div className="flex items-center gap-3">
                      {cat.budget !== undefined && cat.budget > 0 && (
                        <span className="text-body-sm text-body">
                          {formatCurrency(spent)} / {formatCurrency(cat.budget)}
                        </span>
                      )}
                      <button onClick={() => onEdit(cat)} className="text-body-sm text-primary hover:underline hidden group-hover:inline">Editar</button>
                      <button onClick={() => onDelete(cat.id)} className="text-body-sm text-red-500 hover:underline hidden group-hover:inline">Eliminar</button>
                    </div>
                  </div>
                  {cat.budget !== undefined && cat.budget > 0 && (
                    <div className="mt-2 h-1.5 w-full rounded-full bg-canvas-soft overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : 'bg-primary'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
