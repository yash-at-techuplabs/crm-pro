import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, yyyy')
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateColor(str: string): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ]
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Lead statuses
    new: 'bg-blue-500/20 text-blue-400',
    contacted: 'bg-yellow-500/20 text-yellow-400',
    qualified: 'bg-green-500/20 text-green-400',
    unqualified: 'bg-red-500/20 text-red-400',
    converted: 'bg-purple-500/20 text-purple-400',
    
    // Contact statuses
    active: 'bg-green-500/20 text-green-400',
    inactive: 'bg-slate-500/20 text-slate-400',
    do_not_contact: 'bg-red-500/20 text-red-400',
    
    // Deal statuses
    open: 'bg-blue-500/20 text-blue-400',
    won: 'bg-green-500/20 text-green-400',
    lost: 'bg-red-500/20 text-red-400',
    
    // Task/Activity statuses
    pending: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-slate-500/20 text-slate-400'
  }
  
  return statusColors[status] || 'bg-slate-500/20 text-slate-400'
}

export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    low: 'bg-slate-500/20 text-slate-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-orange-500/20 text-orange-400',
    urgent: 'bg-red-500/20 text-red-400'
  }
  
  return priorityColors[priority] || 'bg-slate-500/20 text-slate-400'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), wait)
  }
}

export function calculateDealMetrics(deals: Array<{ value: number; status: string; probability: number }>) {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
  const wonValue = deals.filter(d => d.status === 'won').reduce((sum, d) => sum + d.value, 0)
  const openDeals = deals.filter(d => d.status === 'open')
  const weightedValue = openDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)
  const winRate = deals.length > 0 
    ? (deals.filter(d => d.status === 'won').length / deals.filter(d => d.status !== 'open').length) * 100
    : 0
  
  return {
    totalValue,
    wonValue,
    weightedValue,
    winRate: isNaN(winRate) ? 0 : winRate,
    openCount: openDeals.length,
    totalCount: deals.length
  }
}

