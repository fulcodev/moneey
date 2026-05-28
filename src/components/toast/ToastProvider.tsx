'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning'
}

interface ToastCtx {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

let nextId = 0

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle }
const colors = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-orange-500 text-white',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm" role="region" aria-label="Notificaciones">
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <div key={t.id} role="alert" aria-live="polite"
              className={cn('flex items-center gap-3 px-4 py-3 rounded-xl shadow-elevated animate-slide-up', colors[t.type])}
            >
              <Icon size={18} className="shrink-0" aria-hidden="true" />
              <p className="text-body-sm flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Cerrar notificación" className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
