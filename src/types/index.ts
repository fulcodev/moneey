export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  amountVES?: number
  currency: 'USD' | 'VES'
  exchangeRate?: number
  rateType?: 'oficial' | 'paralelo'
  categoryId: string
  date: string
  notes?: string
  linkedRecurringId?: string
  linkedDebtId?: string
  linkedDebtPaymentId?: string
  linkedGoalId?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon?: string
  color?: string
  budget?: number
}

export interface Debt {
  id: string
  name: string
  type: 'owed' | 'lent'
  totalAmount: number
  remainingAmount: number
  apr?: number
  minPayment?: number
  dueDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AutoSaveSettings {
  percent: number
  enabled: boolean
}

export interface DebtPayment {
  id: string
  debtId: string
  amount: number
  date: string
  notes?: string
  createdAt: string
}

export interface RecurringPayment {
  id: string
  name: string
  amount: number
  categoryId: string
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  dayOfMonth?: number
  dayOfWeek?: number
  startDate: string
  endDate?: string
  active: boolean
  notifyDays?: number
  notifyEmail?: string
  lastNotified?: string
  createdAt: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  autoSavePercent?: number
  deadline?: string
  color?: string
  createdAt: string
  updatedAt: string
}

export interface RunningBalanceEntry {
  date: string
  amount: number
  type: 'income' | 'expense'
  runningBalance: number
  categoryId: string
  id: string
}

export interface BalanceVerification {
  totalIncome: number
  totalExpenses: number
  expectedBalance: number
  computedBalance: number
  difference: number
  isBalanced: boolean
}

export interface PayoffProjection {
  monthsToPayoff: number
  totalInterest: number
  totalPaid: number
  monthlyPayment: number
}

export interface ExchangeRate {
  moneda: string
  fuente: 'oficial' | 'paralelo'
  nombre: string
  compra: number | null
  venta: number | null
  promedio: number
  fechaActualizacion: string
}

export interface ExchangeRateSnapshot {
  id: string
  date: string
  oficial: number
  paralelo: number
  createdAt: string
}

export interface DashboardMetrics {
  balance: number
  totalIncome: number
  totalExpenses: number
  savingsRate: number
  dailyAverage: number
  transactionCount: number
  topCategory: { name: string; amount: number; percentage: number } | null
}

export interface MonthlyAggregate {
  label: string
  income: number
  expense: number
  balance: number
  transactionCount: number
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  color?: string
  type: TransactionType
  totalSpent: number
  totalIncome: number
  transactionCount: number
  averageAmount: number
  budget?: number
  budgetProgress: number
  monthlyTrend: { label: string; amount: number }[]
}

export interface BudgetDetail {
  budgetId: string
  categoryId: string
  categoryName: string
  limit: number
  spent: number
  remaining: number
  percentage: number
  dailyProjected: number
  status: 'on-track' | 'warning' | 'exceeded'
  transactions: Transaction[]
}
