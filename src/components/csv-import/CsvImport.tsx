'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useToast } from '@/components/toast/ToastProvider'
import { getCategoriesSnapshot } from '@/hooks/useCategories'

type BankFormat = 'generic' | 'bbva' | 'galicia' | 'mercado-pago' | 'naranja'

const bankPatterns: { name: string; key: BankFormat; hints: string[] }[] = [
  { name: 'BBVA', key: 'bbva', hints: ['"Fecha"', '"Referencia"', '"Importe"'] },
  { name: 'Galicia / Hipotecario', key: 'galicia', hints: ['Fecha', 'Detalle', 'Debe', 'Haber'] },
  { name: 'Mercado Pago', key: 'mercado-pago', hints: ['fecha', 'descripción', 'monto'] },
  { name: 'Tarjeta Naranja', key: 'naranja', hints: ['FECHA', 'DESCRIPCION', 'IMPORTE'] },
]

function detectFormat(header: string): BankFormat {
  const h = header.toLowerCase()
  for (const bank of bankPatterns) {
    if (bank.hints.every((hint) => h.includes(hint.toLowerCase()))) return bank.key
  }
  return 'generic'
}

function parseLine(
  cols: string[],
  format: BankFormat,
  categories: { id: string; name: string; type: 'income' | 'expense' }[]
) {
  switch (format) {
    case 'bbva': {
      const date = (cols[0] || '').replace(/"/g, '').trim()
      const desc = (cols[1] || '').replace(/"/g, '').trim()
      const rawAmount = (cols[2] || '').replace(/"/g, '').trim()
      const amount = Math.abs(parseFloat(rawAmount.replace(/\./g, '').replace(',', '.')))
      if (!date || isNaN(amount)) return null
      const isExpense = rawAmount.includes('-') || rawAmount.startsWith('(')
      const type = isExpense ? 'expense' as const : 'income' as const
      const cat = matchCategory(desc, categories, type)
      return { date, type, amount, categoryId: cat.id, notes: desc, currency: 'USD' as const }
    }
    case 'galicia': {
      const date = (cols[0] || '').trim()
      const desc = (cols[1] || '').trim()
      const debe = parseFloat((cols[2] || '0').replace(/\./g, '').replace(',', '.'))
      const haber = parseFloat((cols[3] || '0').replace(/\./g, '').replace(',', '.'))
      if (!date || (isNaN(debe) && isNaN(haber))) return null
      const isExpense = debe > 0
      const amount = isExpense ? debe : haber
      const type = isExpense ? 'expense' as const : 'income' as const
      const cat = matchCategory(desc, categories, type)
      return { date, type, amount, categoryId: cat.id, notes: desc, currency: 'USD' as const }
    }
    case 'mercado-pago': {
      const date = (cols[0] || '').trim()
      const desc = (cols[1] || '').trim()
      const rawAmount = (cols[2] || '0').replace(/[^0-9.,-]/g, '').replace(',', '.')
      const amount = Math.abs(parseFloat(rawAmount))
      if (!date || isNaN(amount)) return null
      const isExpense = parseFloat(rawAmount) < 0
      const type = isExpense ? 'expense' as const : 'income' as const
      const cat = matchCategory(desc, categories, type)
      return { date, type, amount, categoryId: cat.id, notes: desc, currency: 'USD' as const }
    }
    default: {
      const dateRaw = cols[0]?.trim()
      const typeRaw = (cols[1] || '').trim().toLowerCase()
      const amountRaw = cols[2]?.trim()
      const categoryRaw = cols[3]?.trim()
      const notesRaw = cols[4]?.trim()
      if (!dateRaw || !amountRaw) return null
      const amount = Math.abs(parseFloat(amountRaw.replace(/[^0-9.,-]/g, '').replace(',', '.')))
      if (isNaN(amount)) return null
      const type = typeRaw === 'income' ? 'income' as const : 'expense' as const
      const cat = categoryRaw
        ? categories.find((c) => c.name.toLowerCase() === categoryRaw.toLowerCase()) || categories.find((c) => c.type === type)!
        : categories.find((c) => c.type === type)!
      return { date: dateRaw, type, amount, categoryId: cat.id, notes: notesRaw || undefined, currency: 'USD' as const }
    }
  }
}

function matchCategory(desc: string, categories: { id: string; name: string; type: 'income' | 'expense' }[], type: 'income' | 'expense') {
  const d = desc.toLowerCase()
  const keywordMap: Record<string, string> = {
    sueldo: 'salary', salario: 'salary', honorarios: 'freelance', factura: 'freelance',
    supermercado: 'food', comidas: 'food', restaurante: 'food', 'rapipago': 'services',
    'servicios': 'services', 'luz': 'services', 'agua': 'services', 'gas': 'services',
    'alquiler': 'rent', 'expensas': 'rent',
    'netflix': 'subscriptions', 'spotify': 'subscriptions', 'disney': 'subscriptions',
    'uber': 'transport', 'taxi': 'transport', 'sube': 'transport', 'nafta': 'transport',
    'ahorro': 'savings', 'plazo fijo': 'savings',
  }

  for (const [keyword, catId] of Object.entries(keywordMap)) {
    if (d.includes(keyword)) {
      const existing = categories.find((c) => c.id === catId)
      if (existing) return existing
    }
  }

  const suffix = type === 'expense' ? 'other-expense' : 'other-income'
  return categories.find((c) => c.id === suffix) || categories.find((c) => c.type === type)!
}

export function CsvImport() {
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<{ ok: number; errors: string[]; format: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const { addTransaction } = useTransactions()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await parseFile(file)
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await parseFile(file)
  }

  const parseFile = async (file: File) => {
    setLoading(true)
    setResult(null)
    const text = await file.text()
    const lines = text.split('\n').filter((l) => l.trim())
    const categories = await getCategoriesSnapshot()
    const errors: string[] = []
    let ok = 0

    const header = lines[0]
    const format = detectFormat(header)
    const startLine = format === 'generic' ? 1 : 1 // skip header

    for (let i = startLine; i < lines.length; i++) {
      try {
        const cols = lines[i].split(',').map((c) => c.trim())
        const parsed = parseLine(cols, format, categories as any)
        if (!parsed) { errors.push(`Línea ${i + 1}: datos inválidos`); continue }
        await addTransaction(parsed)
        ok++
      } catch {
        errors.push(`Línea ${i + 1}: error al procesar`)
      }
    }

    const formatName = bankPatterns.find((b) => b.key === format)?.name || 'Genérico'
    setResult({ ok, errors, format: formatName })
    toast(`Importados ${ok} movimientos (${formatName})`)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-[#e2e2e2] hover:border-primary/50'
        }`}
      >
        <input ref={inputRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
        <p className="text-body text-body">Arrastrá tu CSV o hacé click para seleccionar</p>
        <p className="text-body-sm text-body mt-1">Soporta: BBVA, Galicia, Mercado Pago, Naranja y formato genérico</p>
      </div>

      {loading && <p className="text-body">Procesando...</p>}

      {result && (
        <div className="rounded-lg border border-[#e2e2e2] bg-canvas p-4">
          <p className="text-body-strong text-green-600">{result.ok} movimientos importados ({result.format})</p>
          {result.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-body-sm-strong text-red-500">{result.errors.length} errores:</p>
              <ul className="list-disc pl-4 mt-1 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-body-sm text-red-500">{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-[#e2e2e2] bg-canvas-soft p-4">
        <p className="text-body-sm-strong text-body mb-2">Formatos soportados:</p>
        <div className="space-y-2 text-body-sm text-body">
          <p><strong>BBVA:</strong> "Fecha","Referencia","Importe","Saldo"</p>
          <p><strong>Galicia/Hipotecario:</strong> Fecha,Detalle,Debe,Haber</p>
          <p><strong>Mercado Pago:</strong> fecha,descripción,monto</p>
          <p><strong>Genérico:</strong> date,type,amount,category,notes</p>
        </div>
      </div>
    </div>
  )
}
