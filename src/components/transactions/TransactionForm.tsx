'use client'

import { useState, useEffect, useRef } from 'react'
import { Transaction } from '@/types'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { useRate } from '@/components/rates/ExchangeRateContext'
import { formatCurrency, roundMoney } from '@/lib/utils'
import { validateAmount, validateDate, detectDuplicate } from '@/lib/validation'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

type Currencies = 'USD' | 'VES-O' | 'VES-P'

interface Props {
  initial?: Partial<Transaction>
  existingTransactions?: Transaction[]
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel?: () => void
}

export function TransactionForm({ initial, existingTransactions = [], onSubmit, onCancel }: Props) {
  const { categories, seedDefaults } = useCategories()
  const { oficial, paralelo } = useRate()
  const [type, setType] = useState<'income' | 'expense'>(initial?.type || 'expense')
  const [currency, setCurrency] = useState<Currencies>('USD')
  const [amount, setAmount] = useState(initial?.amount?.toString() || '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [date, setDate] = useState(initial?.date || new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState(initial?.notes || '')
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [duplicateWarn, setDuplicateWarn] = useState<Transaction | null>(null)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => { seedDefaults() }, [seedDefaults])
  useEffect(() => { amountRef.current?.focus() }, [])

  const filtered = categories.filter((c) => c.type === type)
  const parsedAmount = parseFloat(amount) || 0
  const rate = currency === 'VES-O' ? oficial : currency === 'VES-P' ? paralelo : 0
  const usdAmount = currency !== 'USD' && rate > 0 ? roundMoney(parsedAmount / rate) : parsedAmount

  // Formatted display while typing
  const displayAmount = amount ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parsedAmount) : ''

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    if (field === 'amount') {
      const err = validateAmount(parseFloat(value) || 0)
      if (err && value) newErrors.amount = err
      else delete newErrors.amount
    }
    if (field === 'date') {
      const err = validateDate(value)
      if (err) newErrors.date = err
      else delete newErrors.date
    }
    setErrors(newErrors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!amount) { setError('Ingresá un monto'); return }
    const parsed = parseFloat(amount)
    const amountErr = validateAmount(parsed)
    if (amountErr) { setError(amountErr); return }
    if (!categoryId) { setError('Seleccioná una categoría'); return }
    const dateErr = validateDate(date)
    if (dateErr) { setError(dateErr); return }

    const isVES = currency !== 'USD'
    const finalAmount = isVES && rate > 0 ? roundMoney(parsed / rate) : roundMoney(parsed)

    const dup = detectDuplicate(existingTransactions, { amount: finalAmount, categoryId, date, type }, initial?.id)
    if (dup && !duplicateWarn) { setDuplicateWarn(dup); return }

    setLoading(true)
    await onSubmit({
      type,
      amount: finalAmount,
      amountVES: isVES ? roundMoney(parsed) : undefined,
      currency: isVES ? 'VES' : 'USD',
      exchangeRate: isVES ? rate : undefined,
      rateType: isVES ? (currency === 'VES-O' ? 'oficial' as const : 'paralelo' as const) : undefined,
      categoryId,
      date,
      notes: notes || undefined,
    })
    if (!initial) { setAmount(''); setNotes(''); setDate(new Date().toISOString().split('T')[0]); setCategoryId('') }
    setDuplicateWarn(null); setLoading(false)
  }

  const typeColor = type === 'expense' ? 'red' : 'green'

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Type Toggle */}
        <div className="flex gap-2 bg-canvas-soft rounded-xl p-1">
          <button type="button" onClick={() => { setType('expense'); setCategoryId('') }}
            className={`flex-1 py-2.5 rounded-lg text-body-strong transition-all ${type === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'text-ink'}`}>Gasto</button>
          <button type="button" onClick={() => { setType('income'); setCategoryId('') }}
            className={`flex-1 py-2.5 rounded-lg text-body-strong transition-all ${type === 'income' ? 'bg-green-600 text-white shadow-sm' : 'text-ink'}`}>Ingreso</button>
        </div>

        {/* Amount row */}
        <div>
          <label className="text-body-sm text-body mb-1.5 block">Monto</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body text-mute">$</span>
              <input ref={amountRef}
                type="text" inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { const v = e.target.value.replace(/[^0-9.]/g, ''); setAmount(v); validateField('amount', v); setError(null) }}
                className={`w-full h-[48px] rounded-xl border-2 bg-canvas pl-8 pr-4 text-display-sm text-ink placeholder:text-mute focus:outline-none transition-colors ${
                  errors.amount ? 'border-red-400' : 'border-[#e2e2e2] focus:border-primary'
                }`}
              />
            </div>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as Currencies)}
              className="h-[48px] rounded-xl border-2 border-[#e2e2e2] bg-canvas px-3 text-body-sm text-ink focus:outline-none focus:border-primary">
              <option value="USD">USD</option>
              <option value="VES-O">VES·O</option>
              <option value="VES-P">VES·P</option>
            </select>
          </div>
          {amount && (
            <p className={`text-body-sm mt-1.5 ${errors.amount ? 'text-red-500' : 'text-mute'}`}>
              {currency === 'USD' ? `≈ ${formatCurrency(parsedAmount)}` : `≈ ${formatCurrency(usdAmount)} · Bs. ${parsedAmount.toLocaleString()}`}
              {errors.amount && ` · ${errors.amount}`}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="text-body-sm text-body mb-1.5 block">Categoría</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[150px] overflow-y-auto">
            {filtered.map((cat) => {
              const active = cat.id === categoryId
              return (
                <button key={cat.id} type="button" onClick={() => { setCategoryId(cat.id); setError(null) }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-body-sm transition-all ${
                    active ? 'bg-primary text-on-dark shadow-sm' : 'bg-canvas text-ink border border-[#e2e2e2] hover:border-primary/40'
                  }`}
                >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#8e8e93' }} />
              <span className="truncate">{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Date + Notes side-by-side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-body-sm text-body mb-1.5 block">Fecha</label>
            <input type="date" value={date} onChange={(e) => { setDate(e.target.value); validateField('date', e.target.value) }}
              className={`w-full h-[44px] rounded-xl border-2 bg-canvas px-4 text-body text-ink focus:outline-none transition-colors ${
                errors.date ? 'border-red-400' : 'border-[#e2e2e2] focus:border-primary'
              }`} />
            {errors.date && <p className="text-body-sm text-red-500 mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="text-body-sm text-body mb-1.5 block">Notas <span className="text-mute">(opcional)</span></label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Almuerzo, supermercado..."
              className="w-full h-[44px] rounded-xl border-2 border-[#e2e2e2] bg-canvas px-4 text-body text-ink placeholder:text-mute focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 animate-slide-up">
            <p className="text-body-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <p className="text-body-sm text-mute text-center -mb-2">Presiona Ctrl + Enter para guardar rápido</p>
        <div className="flex gap-3 pt-1">
          {onCancel && <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>}
          <Button type="submit" variant="primary" disabled={loading} className="flex-[2]">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </span>
            ) : initial ? 'Actualizar' : `Agregar ${type === 'expense' ? 'gasto' : 'ingreso'}`}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={duplicateWarn !== null}
        title="Posible duplicado"
        message={`Ya existe un movimiento similar por ${formatCurrency(duplicateWarn?.amount || 0)} el mismo día. ¿Agregar de todas formas?`}
        confirmLabel="Agregar de todas formas"
        cancelLabel="Cancelar"
        onConfirm={() => { setDuplicateWarn(null); document.querySelector('form')?.requestSubmit() }}
        onCancel={() => { setDuplicateWarn(null); setError(null) }}
      />
    </>
  )
}
