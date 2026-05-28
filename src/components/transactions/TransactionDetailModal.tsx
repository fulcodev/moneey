'use client'

import { Transaction, Category } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

interface Props {
  transaction: Transaction
  categories: Category[]
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export function TransactionDetailModal({ transaction, categories, onEdit, onDelete, onClose }: Props) {
  const cat = categories.find((c) => c.id === transaction.categoryId)

  const originLabel = transaction.linkedRecurringId ? 'Pago recurrente'
    : transaction.linkedDebtId ? 'Pago de deuda'
    : transaction.linkedGoalId ? 'Ahorro para meta'
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="bg-canvas rounded-xl shadow-elevated w-full max-w-md animate-scale-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e2e2]">
          <h2 className="text-display-sm text-ink">Detalle del movimiento</h2>
          <button onClick={onClose} className="text-body text-body hover:text-ink p-1 rounded-md hover:bg-canvas-soft transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-on-dark shrink-0"
              style={{ backgroundColor: cat?.color || '#8e8e93' }}>
              {transaction.type === 'income' ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
            </div>
            <div>
              <p className="text-body-strong text-ink">{cat?.name || 'Sin categoría'}</p>
              <p className="text-body-sm text-body">{transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</p>
              {originLabel && <p className="text-body-sm text-primary mt-0.5">🔗 {originLabel}</p>}
            </div>
          </div>

          <div className="rounded-xl bg-canvas-soft p-4">
            <p className="text-body-sm text-body mb-1">Monto</p>
            <p className={`text-display-md ${transaction.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-body-sm">
            <div>
              <p className="text-body">Fecha</p>
              <p className="text-ink font-medium">{formatDate(transaction.date)}</p>
            </div>
            {transaction.notes && (
              <div className="col-span-2">
                <p className="text-body">Notas</p>
                <p className="text-ink font-medium">{transaction.notes}</p>
              </div>
            )}
            {transaction.currency === 'VES' && transaction.amountVES && (
              <>
                <div>
                  <p className="text-body">Monto original</p>
                  <p className="text-ink font-medium">Bs. {transaction.amountVES.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-body">Tasa aplicada</p>
                  <p className="text-ink font-medium">Bs. {transaction.exchangeRate?.toFixed(2)} ({transaction.rateType})</p>
                </div>
              </>
            )}
            <div>
              <p className="text-body">Creado</p>
              <p className="text-ink font-medium">{formatDate(transaction.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-[#e2e2e2] justify-end">
          <Button onClick={onDelete} variant="secondary">Eliminar</Button>
          <Button onClick={onEdit} variant="primary">Editar</Button>
        </div>
      </div>
    </div>
  )
}
