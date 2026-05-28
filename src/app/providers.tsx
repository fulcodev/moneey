'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/hooks/useTheme'
import { ToastProvider } from '@/components/toast/ToastProvider'
import { ExchangeRateProvider } from '@/components/rates/ExchangeRateContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <ExchangeRateProvider>
            {children}
          </ExchangeRateProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
