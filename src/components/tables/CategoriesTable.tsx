'use client'

import { Category } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { DataTable, Column } from '@/components/ui/DataTable'
import { BudgetProgress } from '@/components/budgets/BudgetProgress'
import { Button } from '@/components/ui/Button'

interface Props {
  categories: Category[]
  spending: Record<string, number>
  onEdit: (cat: Category) => void
  onDelete: (id: string) => void
  onSetBudget: (cat: Category) => void
  onRowClick?: (cat: Category) => void
}

export function CategoriesTable({ categories, spending, onEdit, onDelete, onSetBudget, onRowClick }: Props) {
  const columns: Column<Category>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (cat) => (
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#8e8e93' }} />
          <span>{cat.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (cat) => (
        <span className={`text-body-sm ${cat.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
          {cat.type === 'income' ? 'Ingreso' : 'Gasto'}
        </span>
      ),
    },
    {
      key: 'budget',
      label: 'Presupuesto',
      sortable: true,
      className: 'text-right',
      render: (cat) => {
        if (cat.type === 'income') return <span className="text-body-sm text-body">—</span>
        const hasBudget = cat.budget && cat.budget > 0
        return (
          <div className="flex items-center justify-end gap-2">
            {hasBudget ? (
              <span className="text-body-sm text-ink">{formatCurrency(cat.budget!)}</span>
            ) : (
              <button onClick={() => onSetBudget(cat)} className="text-body-sm text-primary hover:underline">Fijar</button>
            )}
          </div>
        )
      },
    },
    {
      key: 'spent',
      label: 'Gasto',
      sortable: false,
      className: 'text-right',
      render: (cat) => {
        const spent = spending[cat.id] || 0
        return <span className="text-body-sm text-body">{spent > 0 ? formatCurrency(spent) : '—'}</span>
      },
    },
    {
      key: 'progress',
      label: 'Progreso',
      sortable: false,
      render: (cat) => {
        if (cat.type === 'income' || !cat.budget || cat.budget <= 0) return null
        return (
          <div className="min-w-[120px]">
            <BudgetProgress
              categoryName=""
              limit={cat.budget}
              spent={spending[cat.id] || 0}
              color={cat.color}
            />
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={categories}
      keyExtractor={(c) => c.id}
      searchPlaceholder="Buscá categorías..."
      emptyMessage="Sin categorías"
      onRowClick={onRowClick}
      actions={(cat) => (
        <div className="flex gap-2 justify-end">
          <Button onClick={() => onEdit(cat)} variant="ghost">Editar</Button>
          <Button onClick={() => onDelete(cat.id)} variant="ghost">×</Button>
        </div>
      )}
    />
  )
}
