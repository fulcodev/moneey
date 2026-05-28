'use client'

import { useState } from 'react'
import { useGoals } from '@/hooks/useGoals'
import { useTransactions } from '@/hooks/useTransactions'
import { GoalForm } from '@/components/goals/GoalForm'
import { GoalCard } from '@/components/goals/GoalCard'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/toast/ToastProvider'
import { SavingsGoal } from '@/types'
import { Star } from 'lucide-react'
import { getMonthPeriod, formatCurrency } from '@/lib/utils'

export default function GoalsPage() {
  const { goals, loading, addGoal, updateGoal, deleteGoal, addToGoal } = useGoals()
  const { transactions } = useTransactions()
  const { toast } = useToast()
  const [modal, setModal] = useState<{ goal?: SavingsGoal } | null>(null)
  const [search, setSearch] = useState('')

  const totalProgress = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const overallPct = totalTarget > 0 ? (totalProgress / totalTarget) * 100 : 0

  const month = getMonthPeriod(new Date())
  const monthlyIncome = transactions
    .filter((t) => t.type === 'income' && t.date >= month.start && t.date <= month.end)
    .reduce((s, t) => s + t.amount, 0)
  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date >= month.start && t.date <= month.end)
    .reduce((s, t) => s + t.amount, 0)
  const surplus = monthlyIncome - monthlyExpenses

  const filtered = goals.filter((g) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return g.name.toLowerCase().includes(q) || formatCurrency(g.targetAmount).includes(q)
  })

  const handleAutoFeed = async () => {
    if (surplus <= 0 || goals.length === 0) {
      toast('No hay excedente para distribuir este mes', 'warning'); return
    }
    const perGoal = surplus / goals.length
    for (const g of goals) await addToGoal(g.id, perGoal)
    toast(`Distribuidos ${formatCurrency(surplus)} entre ${goals.length} metas`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg text-ink">Metas de ahorro</h1>
          <p className="text-body text-body mt-1">{goals.length} metas</p>
        </div>
        <Button variant="primary" onClick={() => setModal({})}>Nueva meta</Button>
      </div>

      {goals.length > 0 && (
        <>
          <div className="rounded-xl bg-canvas shadow-card p-5">
            <p className="text-body-sm text-body">Progreso general</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-display-md text-ink">{formatCurrency(totalProgress)}</p>
              <p className="text-body text-body">/ {formatCurrency(totalTarget)}</p>
            </div>
            <div className="h-2.5 w-full rounded-full bg-canvas-soft overflow-hidden mt-2">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(overallPct, 100)}%` }} />
            </div>
            <p className="text-body-sm text-body mt-1">{overallPct.toFixed(0)}% completado</p>
          </div>

          {surplus > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-4 flex items-center justify-between">
              <div>
                <p className="text-body-sm-strong text-green-700 dark:text-green-400">Excedente del mes</p>
                <p className="text-body text-green-600">{formatCurrency(surplus)} disponible</p>
              </div>
              <Button onClick={handleAutoFeed} variant="primary">Distribuir en metas</Button>
            </div>
          )}
        </>
      )}

      <input
        type="text"
        placeholder="Buscá metas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md bg-canvas-soft px-4 py-2.5 text-body text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {loading ? (
        <p className="text-body text-body">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Star size={40} className="text-mute mb-3" aria-hidden="true" />
          <p className="text-body text-body mb-3">Todavía no hay metas</p>
          <Button onClick={() => setModal({})} variant="primary">Crear meta</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onAddAmount={addToGoal}
              onEdit={() => setModal({ goal: g })}
              onDelete={async (id) => { await deleteGoal(id); toast('Meta eliminada') }}
            />
          ))}
        </div>
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)}
        title={modal?.goal ? 'Editar meta' : 'Nueva meta'}
      >
        <GoalForm
          initial={modal?.goal || undefined}
          onSubmit={async (data) => {
            if (modal?.goal) {
              await updateGoal(modal.goal.id, data)
              toast('Meta actualizada')
            } else {
              await addGoal(data)
              toast('Meta creada')
            }
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  )
}
