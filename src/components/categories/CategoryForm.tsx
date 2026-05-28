'use client'

import { useState } from 'react'
import { Category } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  initial?: Partial<Category>
  onSubmit: (data: { name: string; type: 'income' | 'expense'; color?: string; budget?: number }) => Promise<void>
  onCancel?: () => void
}

const presetColors = ['#ff3b30', '#ff9500', '#ff2d55', '#af52de', '#5856d6', '#007aff', '#34c759', '#30d158', '#2997ff', '#0066cc', '#8e8e93']

export function CategoryForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name || '')
  const [type, setType] = useState<'income' | 'expense'>(initial?.type || 'expense')
  const [color, setColor] = useState(initial?.color || presetColors[0])
  const [budget, setBudget] = useState(initial?.budget?.toString() || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSubmit({
      name: name.trim(),
      type,
      color,
      budget: type === 'expense' && budget ? parseFloat(budget) : undefined,
    })
    if (!initial) {
      setName('')
      setBudget('')
      setColor(presetColors[0])
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Comida" required />

      <div className="flex gap-2">
        <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-pill text-body-sm ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-canvas text-ink border border-[#e2e2e2]'}`}>Gasto</button>
        <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-pill text-body-sm ${type === 'income' ? 'bg-green-500 text-white' : 'bg-canvas text-ink border border-[#e2e2e2]'}`}>Ingreso</button>
      </div>

      {type === 'expense' && (
        <Input label="Presupuesto mensual (opcional)" type="number" min="0" step="0.01" placeholder="0.00" value={budget} onChange={(e) => setBudget(e.target.value)} />
      )}

      <div className="flex flex-col gap-1">
        <label className="text-body-sm text-body">Color</label>
        <div className="flex gap-2 flex-wrap">
          {presetColors.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-ink scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Guardando...' : initial ? 'Actualizar' : 'Crear'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
      </div>
    </form>
  )
}
