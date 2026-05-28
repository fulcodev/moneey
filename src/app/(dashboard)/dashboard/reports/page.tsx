'use client'

import { useState, useMemo } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { MonthlyTrendChart } from '@/components/dashboard/MonthlyTrendChart'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getMonthPeriod, formatCurrency } from '@/lib/utils'
import { MonthlyAggregate } from '@/types'

export default function ReportsPage() {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [months, setMonths] = useState(6)

  const filtered = useMemo(() => {
    let result = [...transactions]
    if (typeFilter !== 'all') result = result.filter((t) => t.type === typeFilter)
    if (categoryFilter !== 'all') result = result.filter((t) => t.categoryId === categoryFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId)
        return cat?.name.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q) || t.amount.toString().includes(q)
      })
    }
    return result.sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, typeFilter, categoryFilter, search, categories])

  const monthlyData: MonthlyAggregate[] = useMemo(() => {
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (months - 1 - i))
      const p = getMonthPeriod(d)
      const txs = transactions.filter((t) => t.date >= p.start && t.date <= p.end)
      return {
        label: p.label.substring(0, 3),
        income: txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        balance: 0, transactionCount: 0,
      }
    })
  }, [transactions, months])

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount
    })
    return Object.entries(map).map(([catId, value]) => {
      const cat = categories.find((c) => c.id === catId)
      return { label: cat?.name || 'Sin categoría', value, color: cat?.color || '#8e8e93' }
    }).sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  // Trend data for area chart
  const trendData = useMemo(() => {
    return monthlyData.map((m) => ({ label: m.label, balance: m.income - m.expense }))
  }, [monthlyData])

  const filteredTotals = useMemo(() => {
    return filtered.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount
      else acc.expense += t.amount
      return acc
    }, { income: 0, expense: 0 })
  }, [filtered])

  const exportCsv = () => {
    const header = 'Fecha,Tipo,Categoría,Monto,Notas'
    const rows = filtered.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)
      return [t.date, t.type === 'income' ? 'Ingreso' : 'Gasto', cat?.name || '', t.amount.toString(), t.notes || ''].join(',')
    })
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `moneey-${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg text-ink">Reportes</h1>
          <p className="text-body text-body mt-1">{transactions.length} movimientos</p>
        </div>
        <Button onClick={exportCsv} variant="subtle">Exportar CSV</Button>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-body-sm text-body">Tipo</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
            className="h-[36px] rounded-pill border border-[#e2e2e2] bg-canvas px-4 text-body-sm text-ink focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-body-sm text-body">Categoría</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-[36px] rounded-pill border border-[#e2e2e2] bg-canvas px-4 text-body-sm text-ink focus:outline-none"
          >
            <option value="all">Todas</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-body-sm text-body">Meses</label>
          <select value={months} onChange={(e) => setMonths(parseInt(e.target.value))}
            className="h-[36px] rounded-pill border border-[#e2e2e2] bg-canvas px-4 text-body-sm text-ink focus:outline-none"
          >
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-canvas shadow-card p-5">
          <p className="text-body-strong text-ink mb-3">Ingresos vs Gastos</p>
          <IncomeExpenseChart data={monthlyData} />
        </div>
        <div className="rounded-xl bg-canvas shadow-card p-5">
          <p className="text-body-strong text-ink mb-3">Evolución del balance</p>
          <MonthlyTrendChart data={trendData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-canvas shadow-card p-5">
          <p className="text-body-strong text-ink mb-3">Gastos por categoría</p>
          <CategoryPieChart data={categoryBreakdown} />
        </div>

        <div className="rounded-xl bg-canvas shadow-card p-5">
          <p className="text-body-strong text-ink mb-3">Resumen filtrado</p>
          <div className="space-y-4">
            <div>
              <p className="text-body-sm text-body">Ingresos</p>
              <p className="text-display-sm text-green-600">{formatCurrency(filteredTotals.income)}</p>
            </div>
            <div>
              <p className="text-body-sm text-body">Gastos</p>
              <p className="text-display-sm text-red-500">{formatCurrency(filteredTotals.expense)}</p>
            </div>
            <div>
              <p className="text-body-sm text-body">Balance</p>
              <p className={`text-display-sm ${filteredTotals.income - filteredTotals.expense >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatCurrency(filteredTotals.income - filteredTotals.expense)}
              </p>
            </div>
            <div>
              <p className="text-body-sm text-body">Registros</p>
              <p className="text-display-sm text-ink">{filtered.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtered transactions list */}
      <div className="rounded-xl bg-canvas shadow-card p-5">
        <p className="text-body-strong text-ink mb-3">Movimientos filtrados</p>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filtered.slice(0, 50).map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId)
            return (
              <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-sm hover:bg-canvas-soft/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat?.color || '#8e8e93' }} />
                  <span className="text-body-sm text-body">{t.date}</span>
                  <span className="text-body-sm text-ink">{cat?.name || 'Sin cat.'}</span>
                  {t.notes && <span className="text-body-sm text-body truncate max-w-[150px]">{t.notes}</span>}
                </div>
                <span className={`text-body-strong ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
