'use client'

interface Props {
  periods: { label: string; start: string; end: string }[]
  active: { start: string; end: string }
  onChange: (start: string, end: string) => void
}

export function PeriodSelector({ periods, active, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {periods.map((p) => {
        const isActive = p.start === active.start && p.end === active.end
        return (
          <button
            key={p.label}
            onClick={() => onChange(p.start, p.end)}
            className={`px-4 py-2 rounded-pill text-body-sm transition-all ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'bg-canvas text-ink border border-[#e2e2e2] hover:border-primary/50'
            }`}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
