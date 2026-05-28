'use client'

import { useState } from 'react'
import { useDebts } from '@/hooks/useDebts'
import { DebtsTable } from '@/components/tables/DebtsTable'
import { DebtForm } from '@/components/debts/DebtForm'
import { DebtCard } from '@/components/debts/DebtCard'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/toast/ToastProvider'
import { Debt } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function DebtsPage() {
  const { debts, loading, addDebt, updateDebt, deleteDebt } = useDebts()
  const { toast } = useToast()
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'payments'; debt?: Debt } | null>(null)

  const totals = debts.reduce(
    (acc, d) => {
      if (d.type === 'owed') acc.owed += d.remainingAmount
      else acc.lent += d.remainingAmount
      return acc
    },
    { owed: 0, lent: 0 }
  )

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta deuda?')) {
      deleteDebt(id)
      toast('Deuda eliminada')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg text-ink">Deudas</h1>
          <p className="text-body text-body mt-1">{debts.length} registros</p>
        </div>
        <Button variant="primary" onClick={() => setModal({ type: 'add' })}>Nueva deuda</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-canvas shadow-card p-4">
          <p className="text-body-sm text-body">Debo</p>
          <p className="text-body-strong text-red-500">{formatCurrency(totals.owed)}</p>
        </div>
        <div className="rounded-xl bg-canvas shadow-card p-4">
          <p className="text-body-sm text-body">Me deben</p>
          <p className="text-body-strong text-green-600">{formatCurrency(totals.lent)}</p>
        </div>
      </div>

      <DebtsTable
        debts={debts}
        onEdit={(d) => setModal({ type: 'edit', debt: d })}
        onDelete={handleDelete}
        onShowPayments={(d) => setModal({ type: 'payments', debt: d })}
      />

      <Modal open={modal?.type === 'add' || modal?.type === 'edit'} onClose={() => setModal(null)}
        title={modal?.type === 'edit' ? 'Editar deuda' : 'Nueva deuda'}
      >
        <DebtForm
          initial={modal?.debt || undefined}
          onSubmit={async (data) => {
            if (modal?.type === 'edit' && modal.debt) {
              await updateDebt(modal.debt.id, data)
              toast('Deuda actualizada')
            } else {
              await addDebt(data)
              toast('Deuda creada')
            }
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal open={modal?.type === 'payments'} onClose={() => setModal(null)}
        title={`Pagos — ${modal?.debt?.name || ''}`}
      >
        {modal?.debt && <DebtCard debt={modal.debt} onEdit={() => {}} onDelete={() => {}} />}
      </Modal>
    </div>
  )
}
