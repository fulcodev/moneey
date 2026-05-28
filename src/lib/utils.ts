export const roundMoney = (n: number): number => Math.round(n * 100) / 100
export const add = (a: number, b: number): number => roundMoney(a + b)
export const sub = (a: number, b: number): number => roundMoney(a - b)
export const mul = (a: number, b: number): number => roundMoney(a * b)
export const div = (a: number, b: number): number => b !== 0 ? roundMoney(a / b) : 0
export const safeSum = (arr: number[]): number => arr.reduce((s, v) => add(s, v), 0)

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string): string {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date))
  } catch {
    return date
  }
}

export function cleanData<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined))
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getBiweeklyPeriod(date: Date = new Date()): { label: string; start: string; end: string } {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  if (day <= 15) {
    return {
      label: `1ra quincena ${monthNames[month]}`,
      start: `${year}-${String(month + 1).padStart(2, '0')}-01`,
      end: `${year}-${String(month + 1).padStart(2, '0')}-15`,
    }
  }

  const lastDay = new Date(year, month + 1, 0).getDate()
  return {
    label: `2da quincena ${monthNames[month]}`,
    start: `${year}-${String(month + 1).padStart(2, '0')}-16`,
    end: `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`,
  }
}

export function getMonthPeriod(date: Date = new Date()): { label: string; start: string; end: string } {
  const year = date.getFullYear()
  const month = date.getMonth()
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const lastDay = new Date(year, month + 1, 0).getDate()

  return {
    label: monthNames[month],
    start: `${year}-${String(month + 1).padStart(2, '0')}-01`,
    end: `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`,
  }
}
