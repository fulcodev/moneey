'use client'

import { useState, useEffect } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { useTransactions } from '@/hooks/useTransactions'
import { CategoriesTable } from '@/components/tables/CategoriesTable'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { CategoryDetailModal } from '@/components/dashboard/CategoryDetailModal'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/toast/ToastProvider'
import { Category } from '@/types'

export default function CategoriesPage() {
  const { categories, loading, seedDefaults, addCategory, updateCategory, deleteCategory } = useCategories()
  const { transactions } = useTransactions()
  const { toast } = useToast()
  const [formModal, setFormModal] = useState<{ cat?: Category; budget?: boolean } | null>(null)
  const [detailCat, setDetailCat] = useState<Category | null>(null)

  useEffect(() => { seedDefaults() }, [seedDefaults])

  const spending: Record<string, number> = {}
  transactions.forEach((t) => {
    if (t.type === 'expense') spending[t.categoryId] = (spending[t.categoryId] || 0) + t.amount
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id, transactions)
      toast('Categoría eliminada')
    } catch (err) {
      toast((err as Error).message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg text-ink">Categorías</h1>
          <p className="text-body text-body mt-1">{categories.length} categorías</p>
        </div>
        <Button variant="primary" onClick={() => setFormModal({})}>Nueva categoría</Button>
      </div>

      <CategoriesTable
        categories={categories}
        spending={spending}
        onEdit={(cat) => setFormModal({ cat })}
        onDelete={handleDelete}
        onSetBudget={(cat) => setFormModal({ cat, budget: true })}
        onRowClick={(cat) => setDetailCat(cat)}
      />

      <Modal
        open={formModal !== null}
        onClose={() => setFormModal(null)}
        title={formModal?.cat ? (formModal.budget ? 'Fijar presupuesto' : 'Editar categoría') : 'Nueva categoría'}
      >
        <CategoryForm
          initial={formModal?.cat || undefined}
          onSubmit={async (data) => {
            if (formModal?.cat) {
              await updateCategory(formModal.cat.id, data)
              toast('Categoría actualizada')
            } else {
              await addCategory(data)
              toast('Categoría creada')
            }
            setFormModal(null)
          }}
          onCancel={() => setFormModal(null)}
        />
      </Modal>

      {detailCat && (
        <CategoryDetailModal
          category={detailCat}
          transactions={transactions}
          onClose={() => setDetailCat(null)}
        />
      )}
    </div>
  )
}
