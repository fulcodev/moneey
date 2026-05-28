import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-canvas-soft px-4">
      <div className="text-center space-y-4 max-w-sm">
        <h1 className="text-display-lg text-ink">404</h1>
        <p className="text-body text-body">
          Esta página no existe o fue movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-[22px] py-[11px] rounded-full bg-primary text-on-primary text-body hover:opacity-90 transition-opacity"
        >
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
