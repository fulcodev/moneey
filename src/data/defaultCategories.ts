import { Category } from '@/types'

export const defaultCategories: Category[] = [
  { id: 'salary', name: 'Sueldo', type: 'income', color: '#0066cc' },
  { id: 'freelance', name: 'Freelance', type: 'income', color: '#2997ff' },
  { id: 'investments', name: 'Inversiones', type: 'income', color: '#34c759' },
  { id: 'rental', name: 'Alquileres', type: 'income', color: '#5856d6' },
  { id: 'other-income', name: 'Otros ingresos', type: 'income', color: '#8e8e93' },

  { id: 'food', name: 'Comida', type: 'expense', color: '#ff3b30' },
  { id: 'transport', name: 'Transporte', type: 'expense', color: '#ff9500' },
  { id: 'rent', name: 'Alquiler', type: 'expense', color: '#ff2d55' },
  { id: 'services', name: 'Servicios', type: 'expense', color: '#af52de' },
  { id: 'subscriptions', name: 'Suscripciones', type: 'expense', color: '#5856d6' },
  { id: 'entertainment', name: 'Entretenimiento', type: 'expense', color: '#ff6482' },
  { id: 'health', name: 'Salud', type: 'expense', color: '#34c759' },
  { id: 'education', name: 'Educación', type: 'expense', color: '#007aff' },
  { id: 'shopping', name: 'Compras', type: 'expense', color: '#ff375f' },
  { id: 'savings', name: 'Ahorro', type: 'expense', color: '#30d158' },
  { id: 'debts-payment', name: 'Pago deudas', type: 'expense', color: '#ff453a' },
  { id: 'other-expense', name: 'Otros gastos', type: 'expense', color: '#8e8e93' },
]
