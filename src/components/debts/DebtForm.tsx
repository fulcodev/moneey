'use client'

import { useState } from 'react'
import { Debt } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  initial?: Partial<Debt>
  onSubmit: (data: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel?: () => void
}

export function DebtForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name || '')
  const [type, setType] = useState<'owed' | 'lent'>(initial?.type || 'owed')
  const [totalAmount, setTotal] = useState(initial?.totalAmount?.toString() || '')
  const [dueDate, setDueDate] = useState(initial?.dueDate || '')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !totalAmount) return
    setLoading(true)
    const amount = parseFloat(totalAmount)
    await onSubmit({
      name: name.trim(),
      type,
      totalAmount: amount,
      remainingAmount: initial?.remainingAmount ?? amount,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    })
    if (!initial) { setName(''); setTotal(''); setDueDate(''); setNotes('') }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Préstamo Juan" required />

      <div className="flex gap-2">
        <button type="button" onClick={() => setType('owed')} className={`flex-1 py-2 rounded-pill text-body-sm ${type === 'owed' ? 'bg-red-500 text-white' : 'bg-canvas text-ink border border-[#e2e2e2]'}`}>Debo</button>
        <button type="button" onClick={() => setType('lent')} className={`flex-1 py-2 rounded-pill text-body-sm ${type === 'lent' ? 'bg-green-500 text-white' : 'bg-canvas text-ink border border-[#e2e2e2]'}`}>Presté</button>
      </div>

      <Input label="Monto total" type="number" min="0" step="0.01" value={totalAmount} onChange={(e) => setTotal(e.target.value)} required />
      <Input label="Fecha de vencimiento (opcional)" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <Input label="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Guardando...' : initial ? 'Actualizar' : 'Crear'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
      </div>
    </form>
  )
}
