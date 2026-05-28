'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithEmail } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/toast/ToastProvider'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const ipKey = `login:${email}`
    const { allowed } = checkRateLimit(ipKey, 5, 60_000)
    if (!allowed) { setError('Demasiados intentos. Esperá un minuto.'); return }

    setLoading(true)
    try {
      let token = ''
      try {
        const g = (window as unknown as { grecaptcha?: { execute: (key: string, opts: { action: string }) => Promise<string> } }).grecaptcha
        if (g) token = await g.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action: 'login' })
      } catch { /* non-blocking */ }

      if (token) {
        const verifyRes = await fetch('/api/verify-recaptcha', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyData.success) console.warn('reCAPTCHA failed')
      }

      await loginWithEmail(email, password)
      toast('Sesión iniciada', 'success')
      router.replace('/dashboard')
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos')
      } else if (e.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Esperá un rato.')
      } else {
        setError(e.message || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="mb-4">
          <h1 className="text-display-xl text-ink">Moneey</h1>
          <p className="text-body text-body mt-2">Finanzas personales</p>
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-body-sm text-body">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresá tu contraseña"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-[44px] rounded-md bg-canvas-soft px-4 pr-11 text-body text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-body-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading} variant="primary" className="w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Iniciando...
            </span>
          ) : 'Iniciar sesión'}
        </Button>

        <p className="text-center text-body-sm text-body">
          App personal — solo administrador
        </p>
      </form>
    </div>
  )
}
