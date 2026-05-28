import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: string
  elevated?: boolean
  tinted?: boolean
}

export function Card({ children, className, padding = 'p-6', elevated, tinted }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        elevated && 'shadow-card',
        tinted ? 'bg-canvas-soft' : 'bg-canvas',
        padding,
        className
      )}
    >
      {children}
    </div>
  )
}
