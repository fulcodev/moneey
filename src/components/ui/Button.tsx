'use client'

import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'subtle' | 'floating' | 'large-rounded' | 'ghost'

interface ButtonProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
}

const base = 'inline-flex items-center justify-center gap-2 font-sans select-none min-h-[44px] disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97] transition-all'

const variants: Record<Variant, string> = {
  primary: `${base} bg-primary text-on-primary rounded-pill px-5 text-button-md`,
  secondary: `${base} bg-canvas text-ink rounded-pill px-5 text-button-md border border-[#e2e2e2] active:bg-surface-pressed`,
  subtle: `${base} bg-canvas-soft text-ink rounded-pill px-5 text-button-md active:bg-surface-pressed`,
  floating: `${base} bg-canvas text-ink rounded-pill px-5 text-button-md shadow-[0_2px_8px_rgba(0,0,0,0.16)]`,
  'large-rounded': `${base} bg-primary text-on-primary rounded-xl px-6 text-button-large`,
  ghost: `${base} bg-transparent text-ink text-button-md min-h-[44px]`,
}

export function Button({ children, variant = 'primary', className, disabled, onClick, type = 'button', ...rest }: ButtonProps & Record<string, unknown>) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(variants[variant], className)} {...rest}>
      {children}
    </button>
  )
}
