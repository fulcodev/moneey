'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-body-sm text-body">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-md bg-canvas-soft px-4 py-3 text-body text-ink placeholder:text-mute',
            'focus:outline-none focus:ring-2 focus:ring-primary/20',
            error && 'ring-2 ring-red-400',
            className
          )}
          {...props}
        />
        {error && <span className="text-body-sm text-red-500">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
