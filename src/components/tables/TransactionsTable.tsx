'use client'

import { Transaction, Category } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'

interface Props {
  transactions: Transaction[]
  categories: Category[]
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
  onRowClick?: (t: Transaction) => void
  hasMore?: boolean
  loading?: boolean
  onLoadMore?: () => void
}

export function TransactionsTable({ transactions, categories, onEdit, onDelete, onRowClick, hasMore, loading, onLoadMore }: Props) {
  const columns: Column<Transaction>[] = [
    { key: 'date', label: 'Fecha', render: (t) => <span className="text-body-sm text-body">{formatDate(t.date)}</span> },
    {
      key: 'categoryId', label: 'Categoría',
      render: (t) => {
        const cat = categories.find((c) => c.id === t.categoryId)
        return (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color || '#8e8e93' }} />
            <span>{cat?.name || 'Sin categoría'}</span>
          </div>
        )
      },
    },
    { key: 'notes', label: 'Notas', sortable: false, render: (t) => <span className="text-body-sm text-body truncate max-w-[200px] block">{t.notes || '—'}</span> },
    {
      key: 'linked',
      label: 'Origen',
      sortable: false,
      render: (t) => {
        if (t.linkedRecurringId) return <span className="text-body-sm text-primary">↻ Recurrente</span>
        if (t.linkedDebtId) return <span className="text-body-sm text-primary">⊘ Deuda</span>
        if (t.linkedGoalId) return <span className="text-body-sm text-primary">☆ Meta</span>
        return <span className="text-body-sm text-mute">—</span>
      },
    },
    {
      key: 'amount', label: 'Monto', className: 'text-right',
      render: (t) => (
        <div className="text-right">
          <span className={`text-body-strong ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
          </span>
          {t.currency === 'VES' && t.amountVES && t.exchangeRate && (
            <p className="text-body-sm text-mute">Bs. {t.amountVES.toLocaleString()} ({t.rateType})</p>
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={transactions}
      keyExtractor={(t) => t.id}
      searchPlaceholder="Buscá por categoría, notas o monto..."
      emptyMessage="Todavía no hay movimientos"
      onRowClick={onRowClick}
      hasMore={hasMore}
      loading={loading}
      onLoadMore={onLoadMore}
      actions={(t) => (
        <div className="flex gap-2 justify-end">
          <Button onClick={() => onEdit(t)} variant="ghost">Editar</Button>
          <Button onClick={() => onDelete(t.id)} variant="ghost">×</Button>
        </div>
      )}
    />
  )
}
