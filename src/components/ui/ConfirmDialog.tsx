'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', variant = 'default', onConfirm, onCancel }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const previousRef = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onCancel(); return }
    if (e.key !== 'Tab' || !contentRef.current) return
    const focusable = contentRef.current.querySelectorAll<HTMLElement>('button')
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }, [onCancel])

  useEffect(() => {
    if (open) {
      previousRef.current = document.activeElement as HTMLElement
      requestAnimationFrame(() => {
        const btn = contentRef.current?.querySelector<HTMLElement>('button:last-child')
        btn?.focus()
      })
      window.addEventListener('keydown', handleKeyDown)
    } else {
      previousRef.current?.focus()
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div ref={overlayRef} role="alertdialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in" onClick={onCancel}>
      <div ref={contentRef} className="bg-canvas rounded-xl shadow-elevated w-full max-w-sm p-6 animate-scale-in space-y-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-display-sm text-ink">{title}</p>
        <p className="text-body text-body">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="min-h-[44px] px-4 rounded-pill text-body text-ink border border-[#e2e2e2] hover:bg-canvas-soft transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className={`min-h-[44px] px-4 rounded-pill text-body text-on-dark transition-colors ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:opacity-90'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
