'use client'

import { useState, useEffect } from 'react'
import { useRate } from '@/components/rates/ExchangeRateContext'
import { formatDate } from '@/lib/utils'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { getDbInstance } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth'
import { ExchangeRateSnapshot } from '@/types'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'

export function RateHistoryCard() {
  const { oficial, paralelo, loading, lastUpdate, refresh } = useRate()
  const [history, setHistory] = useState<ExchangeRateSnapshot[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    const col = collection(getDbInstance(), `users/${user.uid}/exchangeRates`)
    const q = query(col, orderBy('date', 'desc'))
    getDocs(q).then((snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ExchangeRateSnapshot)))
    })
  }, [])

  const columns: Column<ExchangeRateSnapshot>[] = [
    { key: 'date', label: 'Fecha', render: (r) => <span className="text-body text-ink">{formatDate(r.date)}</span> },
    { key: 'oficial', label: 'Oficial', className: 'text-right', render: (r) => <span className="text-body-strong text-ink">Bs. {r.oficial.toFixed(2)}</span> },
    { key: 'paralelo', label: 'Paralelo', className: 'text-right', render: (r) => <span className="text-body-strong text-ink">Bs. {r.paralelo.toFixed(2)}</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-canvas shadow-card p-5">
        <p className="text-body-strong text-ink mb-4">Tipo de cambio actual</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-canvas-soft p-4">
            <p className="text-body-sm text-body">Oficial</p>
            <p className="text-display-sm text-ink">
              {loading ? '...' : `Bs. ${oficial.toFixed(2)}`}
            </p>
          </div>
          <div className="rounded-xl bg-canvas-soft p-4">
            <p className="text-body-sm text-body">Paralelo</p>
            <p className="text-display-sm text-ink">
              {loading ? '...' : `Bs. ${paralelo.toFixed(2)}`}
            </p>
          </div>
        </div>
        {lastUpdate && <p className="text-body-sm text-mute mt-2">Actualizado: {formatDate(lastUpdate.split('T')[0])}</p>}
        <div className="mt-3">
          <Button onClick={refresh} variant="subtle" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar ahora'}
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-canvas shadow-card p-5">
        <p className="text-body-strong text-ink mb-4">Historial de tasas</p>
        {history.length === 0 ? (
          <p className="text-body text-body">Sin historial todavía. La tasa se guarda automáticamente al consultarla.</p>
        ) : (
          <DataTable columns={columns} data={history} keyExtractor={(r) => r.id} searchable={false} emptyMessage="Sin datos" />
        )}
      </div>
    </div>
  )
}
