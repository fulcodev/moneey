'use client'

import { useState, useEffect } from 'react'
import { useRecurring } from '@/hooks/useRecurring'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/hooks/useAuth'
import { RecurringTable } from '@/components/tables/RecurringTable'
import { RecurringForm } from '@/components/recurring/RecurringForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/toast/ToastProvider'
import { RecurringPayment } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function RecurringPage() {
  const { payments, loading, addRecurring, updateRecurring, deleteRecurring } = useRecurring()
  const { categories, seedDefaults } = useCategories()
  const { user } = useAuth()
  const { toast } = useToast()
  const [modal, setModal] = useState<{ payment?: RecurringPayment } | null>(null)

  useEffect(() => { seedDefaults() }, [seedDefaults])

  const monthlyTotal = payments
    .filter((p) => p.active)
    .reduce((sum, p) => {
      if (p.frequency === 'monthly') return sum + p.amount
      if (p.frequency === 'biweekly') return sum + p.amount * 2
      if (p.frequency === 'weekly') return sum + p.amount * 4
      if (p.frequency === 'yearly') return sum + p.amount / 12
      return sum
    }, 0)

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este recurrente?')) {
      deleteRecurring(id)
      toast('Recurrente eliminado')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg text-ink">Pagos recurrentes</h1>
          <p className="text-body text-body mt-1">{payments.filter((p) => p.active).length} activos</p>
        </div>
        <Button variant="primary" onClick={() => setModal({})}>Nuevo recurrente</Button>
      </div>

      <div className="rounded-xl bg-canvas shadow-card p-4 max-w-xs">
        <p className="text-body-sm text-body">Total mensual estimado</p>
        <p className="text-display-md text-red-500">{formatCurrency(monthlyTotal)}</p>
      </div>

      <RecurringTable
        payments={payments}
        categories={categories}
        onEdit={(p) => setModal({ payment: p })}
        onDelete={handleDelete}
      />

      <Modal open={modal !== null} onClose={() => setModal(null)}
        title={modal?.payment ? 'Editar recurrente' : 'Nuevo recurrente'}
      >
        <RecurringForm
          initial={modal?.payment || undefined}
          categories={categories}
          userEmail={user?.email || ''}
          onSubmit={async (data) => {
            if (modal?.payment) {
              await updateRecurring(modal.payment.id, data)
              toast('Recurrente actualizado')
            } else {
              await addRecurring(data)
              toast('Recurrente creado')
            }
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  )
}
