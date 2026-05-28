'use client'

import { RecurringPayment, Category } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'

interface Props {
  payments: RecurringPayment[]
  categories: Category[]
  onEdit: (p: RecurringPayment) => void
  onDelete: (id: string) => void
}

const freqLabels: Record<string, string> = {
  weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual', yearly: 'Anual',
}

export function RecurringTable({ payments, categories, onEdit, onDelete }: Props) {
  const active = payments.filter((p) => p.active)
  const inactive = payments.filter((p) => !p.active)

  const columns: Column<RecurringPayment>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (p) => {
        const cat = categories.find((c) => c.id === p.categoryId)
        return (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color || '#8e8e93' }} />
            <span>{p.name}</span>
          </div>
        )
      },
    },
    {
      key: 'amount',
      label: 'Monto',
      className: 'text-right',
      render: (p) => <span className="text-body-strong text-red-500">{formatCurrency(p.amount)}</span>,
    },
    {
      key: 'frequency',
      label: 'Frecuencia',
      render: (p) => <span className="text-body-sm text-body">{freqLabels[p.frequency] || p.frequency}</span>,
    },
    {
      key: 'dayOfMonth',
      label: 'Día',
      className: 'text-right',
      render: (p) => <span className="text-body-sm text-body">{p.dayOfMonth ? `Día ${p.dayOfMonth}` : '—'}</span>,
    },
    {
      key: 'notifyDays',
      label: 'Notif.',
      render: (p) => p.notifyDays ? <span className="text-body-sm text-primary">{p.notifyDays}d antes</span> : <span className="text-body-sm text-mute">—</span>,
    },
  ]

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <DataTable
          columns={columns}
          data={active}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Buscá recurrentes..."
          emptyMessage="Sin pagos activos"
          actions={(p) => (
            <div className="flex gap-2 justify-end">
              <Button onClick={() => onEdit(p)} variant="ghost">Editar</Button>
              <Button onClick={() => onDelete(p.id)} variant="ghost">×</Button>
            </div>
          )}
        />
      )}
      {inactive.length > 0 && (
        <div className="opacity-50">
          <DataTable
            columns={columns}
            data={inactive}
            keyExtractor={(p) => p.id}
            searchable={false}
            emptyMessage=""
          />
        </div>
      )}
    </div>
  )
}
