'use client'

import { useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { TransactionsTable } from '@/components/tables/TransactionsTable'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { CsvImport } from '@/components/csv-import/CsvImport'
import { getBiweeklyPeriod, getMonthPeriod, formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/toast/ToastProvider'
import { Transaction } from '@/types'
import { TableSkeleton } from '@/components/ui/Skeleton'

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loading, hasMore, loadMore } = useTransactions()
  const { categories, seedDefaults } = useCategories()
  const { toast } = useToast()
  const [periodType, setPeriodType] = useState<'monthly' | 'biweekly'>('monthly')
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'import'; transaction?: Transaction } | null>(null)
  const [detailTx, setDetailTx] = useState<Transaction | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const periods = periodType === 'monthly'
    ? Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - i); return getMonthPeriod(d)
      })
    : Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i * 15); return getBiweeklyPeriod(d)
      })

  const [activePeriod, setActivePeriod] = useState(periods[0])

  const filtered = transactions.filter((t) => t.date >= activePeriod.start && t.date <= activePeriod.end)

  const totals = filtered.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.income += t.amount
      else acc.expenses += t.amount
      return acc
    },
    { income: 0, expenses: 0 }
  )

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    toast('Movimiento eliminado')
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg text-ink">Movimientos</h1>
          <p className="text-body text-body mt-1">{transactions.length} registros</p>
        </div>
        <div className="flex gap-2">
          <Button variant="subtle" onClick={() => setModal({ type: 'import' })}>Importar CSV</Button>
          <Button variant="primary" onClick={() => setModal({ type: 'add' })}>Nuevo movimiento</Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <PeriodSelector periods={periods} active={activePeriod} onChange={(s, e) => setActivePeriod({ ...activePeriod, start: s, end: e })} />
        <select value={periodType} onChange={(e) => setPeriodType(e.target.value as 'monthly' | 'biweekly')}
          className="h-[36px] rounded-pill border border-[#e2e2e2] bg-canvas px-4 text-body-sm text-ink focus:outline-none"
        >
          <option value="monthly">Mensual</option>
          <option value="biweekly">Quincenal</option>
        </select>
      </div>

      <div className="flex gap-4 text-body-sm text-body">
        <span>Ingresos: <span className="text-green-600 text-body-strong">{formatCurrency(totals.income)}</span></span>
        <span>Gastos: <span className="text-red-500 text-body-strong">{formatCurrency(totals.expenses)}</span></span>
        <span>Balance: <span className={`text-body-strong ${totals.income - totals.expenses >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {formatCurrency(totals.income - totals.expenses)}
        </span></span>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : (
        <TransactionsTable
          transactions={filtered}
          categories={categories}
          onEdit={(t) => setModal({ type: 'edit', transaction: t })}
          onDelete={(id) => setConfirmDelete(id)}
          onRowClick={(t) => setDetailTx(t)}
          hasMore={hasMore}
          loading={loading}
          onLoadMore={loadMore}
        />
      )}

      <Modal open={modal?.type === 'add' || modal?.type === 'edit'} onClose={() => setModal(null)}
        title={modal?.type === 'edit' ? 'Editar movimiento' : 'Nuevo movimiento'}>
        <TransactionForm
          initial={modal?.transaction || undefined}
          existingTransactions={transactions}
          onSubmit={async (data) => {
            if (modal?.type === 'edit' && modal.transaction) {
              await updateTransaction(modal.transaction.id, data); toast('Movimiento actualizado')
            } else {
              await addTransaction(data); toast('Movimiento agregado')
            }
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal open={modal?.type === 'import'} onClose={() => setModal(null)} title="Importar CSV" wide>
        <CsvImport />
      </Modal>

      {detailTx && (
        <TransactionDetailModal
          transaction={detailTx}
          categories={categories}
          onEdit={() => { setDetailTx(null); setModal({ type: 'edit', transaction: detailTx }) }}
          onDelete={() => { const id = detailTx.id; setDetailTx(null); setConfirmDelete(id) }}
          onClose={() => setDetailTx(null)}
        />
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar movimiento"
        message="¿Estás seguro de eliminar este movimiento? Esta acción no se puede deshacer."
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete) }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
