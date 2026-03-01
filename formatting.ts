import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { CURRENCIES } from './constants'

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const curr = CURRENCIES.find(c => c.code === currency)
  const symbol = curr?.symbol ?? currency
  return `${symbol}${amount.toFixed(2)}`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, 'MMM d, yyyy')
}

export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatBillingCycle(cycle: string): string {
  const map: Record<string, string> = {
    monthly: '/mo',
    yearly: '/yr',
    quarterly: '/qtr',
    weekly: '/wk',
    'one-time': ' one-time',
  }
  return map[cycle] ?? `/${cycle}`
}

export function getMonthlyEquivalent(cost: number, cycle: string): number {
  switch (cycle) {
    case 'yearly': return cost / 12
    case 'quarterly': return cost / 3
    case 'weekly': return cost * 4.33
    case 'one-time': return 0
    default: return cost
  }
}

export function getYearlyEquivalent(cost: number, cycle: string): number {
  switch (cycle) {
    case 'monthly': return cost * 12
    case 'quarterly': return cost * 4
    case 'weekly': return cost * 52
    case 'one-time': return cost
    default: return cost
  }
}

export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
