'use client'

import { SavingsGoal } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'

interface Props {
  goal: SavingsGoal
  onAddAmount: (id: string, amount: number) => Promise<void>
  onEdit: (g: SavingsGoal) => void
  onDelete: (id: string) => void
}

export function GoalCard({ goal, onAddAmount, onEdit, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [amount, setAmount] = useState('')

  const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0
  const remaining = goal.targetAmount - goal.currentAmount
  const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  const handleAdd = async () => {
    if (!amount) return
    await onAddAmount(goal.id, parseFloat(amount))
    setAmount('')
    setShowAdd(false)
  }

  return (
    <div className="rounded-lg border border-[#e2e2e2] bg-canvas p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-body-strong" style={{ backgroundColor: goal.color || '#0066cc' }}>
            {pct >= 100 ? '✓' : '☆'}
          </div>
          <div>
            <h3 className="text-body-strong text-ink">{goal.name}</h3>
            {goal.deadline && daysLeft !== null && (
              <p className="text-body-sm text-body">
                {daysLeft > 0 ? `Faltan ${daysLeft} días` : 'Vencida'}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(goal)} className="text-body-sm text-primary hover:underline">Editar</button>
          <button onClick={() => onDelete(goal.id)} className="text-body-sm text-red-500 hover:underline">Eliminar</button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-display-md" style={{ color: goal.color || '#0066cc' }}>{formatCurrency(goal.currentAmount)}</p>
        <p className="text-body text-body">/ {formatCurrency(goal.targetAmount)}</p>
      </div>

      <div className="h-2.5 w-full rounded-full bg-canvas-soft overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: goal.color || '#0066cc' }} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-body-sm text-body">{pct.toFixed(0)}% completado</p>
        {remaining > 0 && (
          <p className="text-body-sm text-body">Faltan {formatCurrency(remaining)}</p>
        )}
      </div>

      {!showAdd ? (
        <Button onClick={() => setShowAdd(true)} variant="secondary">Agregar dinero</Button>
      ) : (
        <div className="flex gap-2">
          <Input type="number" min="0" step="0.01" placeholder="Monto" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button onClick={handleAdd} variant="primary">Agregar</Button>
          <Button onClick={() => setShowAdd(false)} variant="secondary">×</Button>
        </div>
      )}
    </div>
  )
}
