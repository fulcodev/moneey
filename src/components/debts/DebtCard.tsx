'use client'

import { Debt, DebtPayment } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useState } from 'react'
import { useDebtPayments } from '@/hooks/useDebts'
import { Button } from '@/components/ui/Button'

interface Props {
  debt: Debt
  onEdit: (d: Debt) => void
  onDelete: (id: string) => void
}

export function DebtCard({ debt, onEdit, onDelete }: Props) {
  const [showPayments, setShowPayments] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const { payments, addPayment, deletePayment } = useDebtPayments(debt.id, debt.name)

  const pct = debt.totalAmount > 0
    ? Math.min(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100, 100)
    : 0
  const isOwed = debt.type === 'owed'

  const handleAddPayment = async () => {
    if (!paymentAmount) return
    await addPayment({
      debtId: debt.id,
      amount: parseFloat(paymentAmount),
      date: new Date().toISOString().split('T')[0],
    })
    setPaymentAmount('')
  }

  return (
    <div className="rounded-lg border border-[#e2e2e2] bg-canvas p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isOwed ? 'bg-red-500' : 'bg-green-500'}`} />
            <h3 className="text-body-strong text-ink">{debt.name}</h3>
            <span className="text-body-sm text-body bg-canvas-soft px-2 py-0.5 rounded-pill">
              {isOwed ? 'Debo' : 'Presté'}
            </span>
          </div>
          {debt.notes && <p className="text-body-sm text-body mt-0.5">{debt.notes}</p>}
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(debt)} className="text-body-sm text-primary hover:underline">Editar</button>
          <button onClick={() => onDelete(debt.id)} className="text-body-sm text-red-500 hover:underline">Eliminar</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-body-sm text-body">Total</p>
          <p className="text-body-strong text-ink">{formatCurrency(debt.totalAmount)}</p>
        </div>
        <div>
          <p className="text-body-sm text-body">Restante</p>
          <p className={`text-body-strong ${debt.remainingAmount > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {formatCurrency(debt.remainingAmount)}
          </p>
        </div>
      </div>

      {debt.dueDate && (
        <p className="text-body-sm text-body">Vence: {formatDate(debt.dueDate)}</p>
      )}

      <div className="h-2 w-full rounded-full bg-canvas-soft overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-body-sm text-body">{pct.toFixed(0)}% pagado</p>

      <button
        onClick={() => setShowPayments(!showPayments)}
        className="text-body-sm text-primary hover:underline"
      >
        {showPayments ? 'Ocultar pagos' : `Ver pagos (${payments.length})`}
      </button>

      {showPayments && (
        <div className="space-y-3 border-t border-[#e2e2e2] pt-3">
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Monto del pago"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <Button onClick={handleAddPayment} variant="primary">Pagar</Button>
          </div>

          {payments.length === 0 ? (
            <p className="text-body-sm text-body">Sin pagos registrados</p>
          ) : (
            <div className="space-y-1">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded-sm bg-canvas-soft/50">
                  <div>
                    <span className="text-body-sm text-ink">{formatDate(p.date)}</span>
                    <span className="text-body-sm text-body ml-2">{p.notes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm-strong text-green-600">-{formatCurrency(p.amount)}</span>
                    <button onClick={() => deletePayment(p.id, p.amount)} className="text-body-sm text-red-500 hover:underline">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { Input } from '@/components/ui/Input'
