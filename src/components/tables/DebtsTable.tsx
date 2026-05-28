'use client'

import { Debt } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'

interface Props {
  debts: Debt[]
  onEdit: (d: Debt) => void
  onDelete: (id: string) => void
  onShowPayments: (d: Debt) => void
}

export function DebtsTable({ debts, onEdit, onDelete, onShowPayments }: Props) {
  const active = debts.filter((d) => d.remainingAmount > 0)
  const paid = debts.filter((d) => d.remainingAmount <= 0)

  const columns: Column<Debt>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (d) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${d.type === 'owed' ? 'bg-red-500' : 'bg-green-500'}`} />
          <span>{d.name}</span>
          <span className="text-body-sm text-body bg-canvas-soft px-2 py-0.5 rounded-pill">
            {d.type === 'owed' ? 'Debo' : 'Presté'}
          </span>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Total',
      className: 'text-right',
      render: (d) => <span className="text-body-strong">{formatCurrency(d.totalAmount)}</span>,
    },
    {
      key: 'remainingAmount',
      label: 'Restante',
      className: 'text-right',
      render: (d) => (
        <span className={`text-body-strong ${d.remainingAmount > 0 ? 'text-red-500' : 'text-green-600'}`}>
          {formatCurrency(d.remainingAmount)}
        </span>
      ),
    },
    {
      key: 'progress',
      label: 'Progreso',
      sortable: false,
      render: (d) => {
        const pct = d.totalAmount > 0 ? ((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100 : 0
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-canvas-soft overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="text-body-sm text-body">{pct.toFixed(0)}%</span>
          </div>
        )
      },
    },
    {
      key: 'dueDate',
      label: 'Vence',
      render: (d) => <span className="text-body-sm text-body">{d.dueDate ? formatDate(d.dueDate) : '—'}</span>,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-body-strong text-ink mb-3">Activas</h3>
        <DataTable
          columns={columns}
          data={active}
          keyExtractor={(d) => d.id}
          searchPlaceholder="Buscá deudas..."
          emptyMessage="Sin deudas activas"
          actions={(d) => (
            <div className="flex gap-2 justify-end">
              <Button onClick={() => onShowPayments(d)} variant="ghost">Pagos</Button>
              <Button onClick={() => onEdit(d)} variant="ghost">Editar</Button>
              <Button onClick={() => onDelete(d.id)} variant="ghost">×</Button>
            </div>
          )}
        />
      </div>
      {paid.length > 0 && (
        <div className="opacity-60">
          <h3 className="text-body-strong text-ink mb-3">Pagadas</h3>
          <DataTable
            columns={columns}
            data={paid}
            keyExtractor={(d) => d.id}
            searchable={false}
            emptyMessage=""
          />
        </div>
      )}
    </div>
  )
}
