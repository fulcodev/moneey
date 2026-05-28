'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'
import {
  LayoutDashboard, ArrowLeftRight, Tags, CircleDollarSign,
  Repeat, Star, BarChart3, LogOut, Sun, Moon, X,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Movimientos', icon: ArrowLeftRight },
  { href: '/dashboard/categories', label: 'Categorías', icon: Tags },
  { href: '/dashboard/debts', label: 'Deudas', icon: CircleDollarSign },
  { href: '/dashboard/recurring', label: 'Recurrentes', icon: Repeat },
  { href: '/dashboard/goals', label: 'Metas', icon: Star },
  { href: '/dashboard/reports', label: 'Reportes', icon: BarChart3 },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { dark, toggle } = useTheme()

  const handleNav = () => {
    if (window.innerWidth < 768) onClose()
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden animate-fade-in" onClick={onClose} />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-40 h-full w-[240px] bg-primary text-on-dark flex flex-col transition-all duration-300',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-6 h-[60px]">
          <span className="text-display-sm text-on-dark">Moneey</span>
          <button onClick={onClose} aria-label="Cerrar menú" className="text-mute hover:text-on-dark p-2 rounded-md hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Navegación principal">
          {navItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNav}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-md text-body transition-all',
                  active
                    ? 'bg-white/10 text-on-dark font-medium'
                    : 'text-white/70 hover:text-on-dark hover:bg-white/5'
                )}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-body-sm text-white/70">Tema</span>
            <button onClick={toggle} aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'} className="text-body-sm text-white/70 hover:text-on-dark transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          {user && <div className="px-4 py-2 text-body-sm text-white/50 truncate">{user.email}</div>}
          <button
            onClick={() => logout()}
            aria-label="Cerrar sesión"
            className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-md text-body text-white/70 hover:text-on-dark hover:bg-white/5 transition-colors"
          >
            <LogOut size={20} aria-hidden="true" />
            <span>Salir</span>
          </button>
        </div>
      </aside>
    </>
  )
}
