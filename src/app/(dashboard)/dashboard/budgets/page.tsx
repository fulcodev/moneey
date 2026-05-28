'use client'

import { useState, useEffect } from 'react'
import { useBudgets } from '@/hooks/useBudget'
import { useCategories } from '@/hooks/useCategories'
import { useTransactions } from '@/hooks/useTransactions'
import { BudgetProgress } from '@/components/budgets/BudgetProgress'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/toast/ToastProvider'
import { getMonthPeriod, formatCurrency } from '@/lib/utils'
import { BarChart3 } from 'lucide-react'

export default function BudgetsPage() {
  const { budgets, setBudget, deleteBudget } = useBudgets()
  const { categories, seedDefaults } = useCategories()
  const { transactions } = useTransactions()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [newCatId, setNewCatId] = useState('')
  const [newLimit, setNewLimit] = useState('')

  useEffect(() => { seedDefaults() }, [seedDefaults])

  const month = getMonthPeriod(new Date())
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const monthlySpending: Record<string, number> = {}
  transactions.forEach((t) => {
    if (t.type === 'expense' && t.date >= month.start && t.date <= month.end) {
      monthlySpending[t.categoryId] = (monthlySpending[t.categoryId] || 0) + t.amount
    }
  })

  const handleAddBudget = async () => {
    if (!newCatId || !newLimit) return
    const cat = categories.find((c) => c.id === newCatId)
    await setBudget(newCatId, cat?.name || '', parseFloat(newLimit), month.start)
    toast('Presupuesto creado')
    setShowForm(false)
    setNewCatId('')
    setNewLimit('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg text-ink">Presupuestos</h1>
          <p className="text-body text-body mt-1">{month.label}</p>
        </div>
        {!showForm && <Button variant="primary" onClick={() => setShowForm(true)}>Nuevo presupuesto</Button>}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo presupuesto">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-body-sm text-body">Categoría</label>
            <select value={newCatId} onChange={(e) => setNewCatId(e.target.value)}
              className="h-[44px] rounded-md bg-canvas-soft px-4 text-body text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Seleccionar</option>
              {expenseCategories.filter((c) => !budgets.find((b) => b.categoryId === c.id)).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input label="Límite mensual" type="number" min="0" step="0.01" placeholder="0.00" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} />
          <div className="flex gap-3">
            <Button onClick={handleAddBudget} variant="primary">Guardar</Button>
            <Button onClick={() => setShowForm(false)} variant="secondary">Cancelar</Button>
          </div>
        </div>
      </Modal>

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 size={40} className="text-mute mb-3" aria-hidden="true" />
          <p className="text-body text-body mb-3">Sin presupuestos todavía</p>
          <Button onClick={() => setShowForm(true)} variant="primary">Crear presupuesto</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => (
            <div key={b.id} className="rounded-xl bg-canvas shadow-card p-5">
              <BudgetProgress
                categoryName={b.categoryName}
                limit={b.limit}
                spent={monthlySpending[b.categoryId] || 0}
                color={categories.find((c) => c.id === b.categoryId)?.color}
              />
              <button onClick={() => { deleteBudget(b.id); toast('Presupuesto eliminado') }}
                className="mt-2 text-body-sm text-red-500 hover:underline">Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
