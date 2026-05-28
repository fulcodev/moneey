export function Skeleton({ className = '', count = 1 }: { className?: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-skeleton rounded-md ${className || 'h-4 w-full'}`} />
      ))}
    </>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="animate-skeleton h-4 rounded-md flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={`animate-skeleton h-3 rounded-md ${j === 0 ? 'flex-[2]' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-canvas shadow-card p-5 space-y-3">
      <div className="animate-skeleton h-4 w-24 rounded-md" />
      <div className="animate-skeleton h-8 w-36 rounded-md" />
      <div className="animate-skeleton h-3 w-48 rounded-md" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl bg-canvas shadow-card p-5 space-y-4">
      <div className="animate-skeleton h-4 w-32 rounded-md" />
      <div className="animate-skeleton h-[200px] w-full rounded-lg" />
    </div>
  )
}

export function MetricSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-canvas shadow-card p-4 space-y-2">
          <div className="animate-skeleton h-3 w-16 rounded-md" />
          <div className="animate-skeleton h-7 w-24 rounded-md" />
        </div>
      ))}
    </div>
  )
}
