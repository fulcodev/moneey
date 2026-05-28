'use client'

import { RateHistoryCard } from '@/components/rates/RateHistoryCard'

export default function RatesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-display-lg text-ink mb-6">Tipo de cambio USD/VES</h1>
      <RateHistoryCard />
    </div>
  )
}
