import { Transaction } from '@/types'
import { roundMoney } from '@/lib/utils'

const MAX_AMOUNT = 999999.99
const MIN_YEAR = 2000

export function validateAmount(amount: number): string | null {
  if (isNaN(amount) || amount <= 0) return 'El monto debe ser mayor a 0'
  if (amount > MAX_AMOUNT) return `El monto no puede superar $${MAX_AMOUNT.toLocaleString()}`
  if (roundMoney(amount) !== amount) return 'El monto tiene más de 2 decimales'
  return null
}

export function validateDate(dateStr: string): string | null {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'Fecha inválida'
  if (d.getFullYear() < MIN_YEAR) return 'Fecha muy antigua'
  const maxFuture = new Date()
  maxFuture.setFullYear(maxFuture.getFullYear() + 1)
  if (d > maxFuture) return 'No podés registrar transacciones con más de 1 año en el futuro'
  return null
}

export function validateTransaction(tx: { amount: number; date: string; categoryId: string; type: string }): string | null {
  const amountErr = validateAmount(tx.amount)
  if (amountErr) return amountErr
  const dateErr = validateDate(tx.date)
  if (dateErr) return dateErr
  if (!tx.categoryId) return 'Seleccioná una categoría'
  if (!tx.type) return 'Seleccioná tipo ingreso/gasto'
  return null
}

export function detectDuplicate(
  transactions: Transaction[],
  newTx: { amount: number; categoryId: string; date: string; type: string },
  excludeId?: string
): Transaction | null {
  const newDate = new Date(newTx.date).getTime()

  return transactions.find((t) => {
    if (excludeId && t.id === excludeId) return false
    if (t.categoryId !== newTx.categoryId) return false
    if (t.type !== newTx.type) return false
    if (roundMoney(t.amount) !== roundMoney(newTx.amount)) return false
    const tDate = new Date(t.date).getTime()
    const diff = Math.abs(tDate - newDate)
    return diff <= 2 * 24 * 60 * 60 * 1000
  }) || null
}
