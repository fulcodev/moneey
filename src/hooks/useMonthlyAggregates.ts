'use client'

import { useState, useEffect, useMemo } from 'react'
import { Transaction } from '@/types'
import { computeAggregateRange } from '@/lib/aggregateHelpers'
import { MonthlyAggregate } from '@/types'

export function useMonthlyAggregates(transactions: Transaction[], months = 12) {
  const aggregates = useMemo(() => {
    if (transactions.length === 0) return []
    return computeAggregateRange(transactions, months)
  }, [transactions, months])

  const latest = aggregates[aggregates.length - 1] || null
  const previous = aggregates[aggregates.length - 2] || null

  const trend = useMemo(() => {
    return aggregates.map((a) => ({
      label: a.yearMonth.substring(5),
      income: a.income,
      expense: a.expense,
      balance: a.balance,
      transactionCount: a.count,
    }))
  }, [aggregates])

  return { aggregates, latest, previous, trend }
}
