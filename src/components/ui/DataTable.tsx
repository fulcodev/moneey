'use client'

import { useState, useMemo, useRef, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SearchX } from 'lucide-react'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  onRowClick?: (row: T) => void
  actions?: (row: T) => ReactNode
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

const ROW_HEIGHT = 53
const OVERSCAN = 10

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin datos',
  onRowClick,
  actions,
  onLoadMore,
  hasMore = false,
  loading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const val = (row as Record<string, unknown>)[col.key]
        return String(val ?? '').toLowerCase().includes(q)
      })
    )
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = typeof aVal === 'number' ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  // Virtual scrolling
  const containerHeight = containerRef.current?.clientHeight || 400
  const totalHeight = sorted.length * ROW_HEIGHT
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const endIdx = Math.min(sorted.length, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN)
  const visibleRows = sorted.slice(startIdx, endIdx)

  const onScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop: st, scrollHeight, clientHeight } = containerRef.current
    setScrollTop(st)
    if (onLoadMore && hasMore && !loading && st + clientHeight > scrollHeight - 200) onLoadMore()
  }, [onLoadMore, hasMore, loading])

  return (
    <div className="space-y-3">
      {searchable && (
        <input type="text" placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md bg-canvas-soft px-4 py-2.5 text-body text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-primary/20" />
      )}

      <div className="overflow-hidden rounded-xl border border-[#e2e2e2]">
        <table className="w-full text-left" role="grid">
          <thead>
            <tr className="border-b border-[#e2e2e2] bg-canvas-soft/50">
              {columns.map((col) => (
                <th key={col.key}
                  className={cn('px-4 py-3 text-body-sm-strong text-ink sticky top-0 bg-canvas-soft/50 z-10',
                    col.sortable !== false && 'cursor-pointer select-none hover:bg-canvas-soft', col.className)}
                  onClick={() => { if (col.sortable !== false) toggleSort(col.key) }}
                  scope="col"
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && <span className="text-body-sm text-body">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-body-sm-strong text-body text-right sticky top-0 bg-canvas-soft/50 z-10" scope="col">Acción</th>}
            </tr>
          </thead>
        </table>

        <div ref={containerRef} className="overflow-y-auto" style={{ maxHeight: 500 }} onScroll={onScroll}>
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <SearchX size={40} className="text-mute mb-3" aria-hidden="true" />
              <p className="text-body text-body">{search ? 'No se encontraron resultados' : emptyMessage}</p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-2 text-body-sm text-primary hover:underline">Limpiar búsqueda</button>
              )}
            </div>
          ) : (
            <table className="w-full text-left">
              <tbody>
                <tr style={{ height: startIdx * ROW_HEIGHT }} aria-hidden="true" />
                {visibleRows.map((row) => (
                  <tr key={keyExtractor(row)} onClick={() => onRowClick?.(row)}
                    className={cn('border-b border-[#e2e2e2] last:border-0 transition-all duration-150',
                      onRowClick ? 'cursor-pointer hover:bg-canvas-soft/40' : 'hover:bg-canvas-soft/20')}
                    style={{ height: ROW_HEIGHT }}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3 text-body text-ink truncate tabular-nums', col.className)}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))}
                <tr style={{ height: Math.max(0, totalHeight - (endIdx * ROW_HEIGHT)) }} aria-hidden="true" />
              </tbody>
            </table>
          )}
          {loading && <div className="px-4 py-3 text-center text-body-sm text-mute animate-pulse">Cargando más...</div>}
        </div>
      </div>

      <p className="text-body-sm text-body">{sorted.length} registros</p>
    </div>
  )
}
