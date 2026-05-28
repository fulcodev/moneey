'use client'

import { ReactNode, createContext, useContext } from 'react'
import { useExchangeRate } from '@/hooks/useExchangeRate'

interface RateContextValue {
  oficial: number
  paralelo: number
  loading: boolean
  lastUpdate: string | null
  refresh: () => Promise<void>
}

const RateContext = createContext<RateContextValue>(null!)

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const { oficial, paralelo, loading, lastUpdate, refresh } = useExchangeRate()
  return (
    <RateContext.Provider value={{ oficial, paralelo, loading, lastUpdate, refresh }}>
      {children}
    </RateContext.Provider>
  )
}

export function useRate() {
  return useContext(RateContext)
}
