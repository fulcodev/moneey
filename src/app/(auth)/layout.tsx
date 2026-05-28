'use client'

import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-canvas-soft">
        <div className="text-body text-body">Cargando...</div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="flex items-center justify-center min-h-screen bg-canvas-soft px-4">
      {children}
    </div>
  )
}
