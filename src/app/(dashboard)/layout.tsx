'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Sidebar } from '@/components/ui/Sidebar'
import { ReactNode } from 'react'
import { Menu } from 'lucide-react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar')
    if (stored === 'false') setSidebarOpen(false)
  }, [])

  const toggle = () => {
    setSidebarOpen((prev) => {
      const next = !prev
      localStorage.setItem('sidebar', String(next))
      return next
    })
  }

  return (
    <AuthGuard>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`min-h-screen bg-canvas transition-all duration-300 ${sidebarOpen ? 'md:ml-[240px]' : 'md:ml-0'}`}>
        <header className="sticky top-0 z-20 h-[56px] bg-canvas/80 backdrop-blur-sm border-b border-[#e2e2e2] dark:border-[#3a3a3c] flex items-center px-4 md:px-6 gap-3">
          <button onClick={toggle} aria-label="Alternar menú" className="text-ink hover:bg-canvas-soft rounded-md transition-colors h-10 w-10 flex items-center justify-center">
            <Menu size={20} />
          </button>
          <span className="text-body-strong text-ink">Moneey</span>
        </header>
        <main id="main-content" className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
