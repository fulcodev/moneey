'use client'

import { useState } from 'react'
import { SavingsGoal } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  initial?: Partial<SavingsGoal>
  onSubmit: (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel?: () => void
}

const presetColors = ['#0066cc', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#5856d6', '#30d158', '#2997ff']

export function GoalForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name || '')
  const [targetAmount, setTarget] = useState(initial?.targetAmount?.toString() || '')
  const [deadline, setDeadline] = useState(initial?.deadline || '')
  const [color, setColor] = useState(initial?.color || presetColors[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !targetAmount) return
    setLoading(true)
    await onSubmit({
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: initial?.currentAmount ?? 0,
      deadline: deadline || undefined,
      color,
    })
    if (!initial) { setName(''); setTarget(''); setDeadline('') }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Viaje a Japón" required />
      <Input label="Meta" type="number" min="0" step="0.01" value={targetAmount} onChange={(e) => setTarget(e.target.value)} required />
      <Input label="Fecha límite (opcional)" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

      <div className="flex flex-col gap-1">
        <label className="text-body-sm text-body">Color</label>
        <div className="flex gap-2 flex-wrap">
          {presetColors.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-ink scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Guardando...' : initial ? 'Actualizar' : 'Crear'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
      </div>
    </form>
  )
}
