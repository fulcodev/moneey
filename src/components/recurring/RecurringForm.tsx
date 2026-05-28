'use client'

import { useState } from 'react'
import { RecurringPayment } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  initial?: Partial<RecurringPayment>
  categories: { id: string; name: string }[]
  userEmail?: string
  onSubmit: (data: Omit<RecurringPayment, 'id' | 'createdAt'>) => Promise<void>
  onCancel?: () => void
}

export function RecurringForm({ initial, categories, userEmail, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name || '')
  const [amount, setAmount] = useState(initial?.amount?.toString() || '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'yearly'>(initial?.frequency || 'monthly')
  const [dayOfMonth, setDayOfMonth] = useState(initial?.dayOfMonth || 1)
  const [notifyDays, setNotifyDays] = useState(initial?.notifyDays || 0)
  const [notifyEmail, setNotifyEmail] = useState(initial?.notifyEmail || userEmail || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !categoryId) return
    setLoading(true)
    await onSubmit({
      name: name.trim(),
      amount: parseFloat(amount),
      categoryId,
      frequency: frequency as RecurringPayment['frequency'],
      dayOfMonth: frequency === 'monthly' || frequency === 'yearly' ? dayOfMonth : undefined,
      startDate: initial?.startDate || new Date().toISOString().split('T')[0],
      active: initial?.active ?? true,
      notifyDays: notifyDays > 0 ? notifyDays : undefined,
      notifyEmail: notifyDays > 0 && notifyEmail ? notifyEmail : undefined,
    })
    if (!initial) { setName(''); setAmount('') }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Netflix" required />

      <Input label="Monto" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />

      <div className="flex flex-col gap-1">
        <label className="text-body-sm text-body">Categoría</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
          className="h-[44px] rounded-pill border border-[#e2e2e2] bg-canvas px-5 text-body text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Seleccionar</option>
          {categories.filter((c) => c.id).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-body-sm text-body">Frecuencia</label>
        <select value={frequency} onChange={(e) => setFrequency(e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'yearly')}
          className="h-[44px] rounded-pill border border-[#e2e2e2] bg-canvas px-5 text-body text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="weekly">Semanal</option>
          <option value="biweekly">Quincenal</option>
          <option value="monthly">Mensual</option>
          <option value="yearly">Anual</option>
        </select>
      </div>

      {(frequency === 'monthly' || frequency === 'yearly') && (
        <Input label="Día del mes" type="number" min="1" max="31" value={dayOfMonth.toString()} onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)} />
      )}

      <div className="border-t border-[#e2e2e2] pt-4 mt-2">
        <p className="text-body-sm-strong text-ink mb-3">Recordatorio por email</p>

        <div className="flex flex-col gap-1 mb-3">
          <label className="text-body-sm text-body">Notificar días antes</label>
          <select value={notifyDays} onChange={(e) => setNotifyDays(parseInt(e.target.value))}
            className="h-[44px] rounded-pill border border-[#e2e2e2] bg-canvas px-5 text-body text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={0}>No notificar</option>
            <option value={1}>1 día antes</option>
            <option value={2}>2 días antes</option>
            <option value={3}>3 días antes</option>
            <option value={5}>5 días antes</option>
            <option value={7}>7 días antes</option>
          </select>
        </div>

        {notifyDays > 0 && (
          <Input label="Email de notificación" type="email" value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder={userEmail || 'tu@email.com'}
          />
        )}
      </div>

      <div className="flex gap-3 mt-2">
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Guardando...' : initial ? 'Actualizar' : 'Agregar'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
      </div>
    </form>
  )
}
