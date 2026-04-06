export function formatMoney(amount: number, currency = 'KZT'): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' ' + (currency === 'KZT' ? '₸' : currency)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера'

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
}

export function formatMonthUpper(date: Date): string {
  return date.toLocaleDateString('ru-RU', { month: 'long' }).toUpperCase()
}

export function formatMonthFull(date: Date): string {
  const s = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1).replace(' г.', '')
}

export function formatDayFull(dateStr: string): string {
  const date = new Date(dateStr)
  const s = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {}
  for (const item of items) {
    const key = new Date(item.date).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return groups
}

const ACCOUNT_TYPE_NAMES: Record<string, string> = {
  cash: 'Наличные',
  debit: 'Дебетовая',
  credit: 'Кредитная',
  savings: 'Накопительный',
  ewallet: 'Электронный',
}

export function accountTypeName(type: string): string {
  return ACCOUNT_TYPE_NAMES[type] ?? type
}

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  transport: '🚕',
  shopping: '🛍️',
  entertainment: '🎮',
  health: '💊',
  bills: '📄',
  education: '📚',
  salary: '💰',
  freelance: '💻',
  gift: '🎁',
  rent: '🏠',
  travel: '✈️',
  sport: '⚽',
  beauty: '💅',
  pets: '🐕',
  other: '📦',
  wallet: '👛',
  transfer: '🔄',
}

export function getCategoryIcon(iconName: string): string {
  return CATEGORY_ICONS[iconName] ?? '📦'
}

export const AVAILABLE_ICONS = Object.entries(CATEGORY_ICONS).map(([key, emoji]) => ({
  key,
  emoji,
}))

export const COLORS = [
  '#007AFF', '#FF3B30', '#FF9500', '#FFCC00',
  '#34C759', '#5856D6', '#AF52DE', '#FF2D55',
  '#5AC8FA', '#00C7BE', '#FF6482', '#8E8E93',
]

export const ACCOUNT_ICONS: Record<string, string> = {
  cash: '💵',
  debit: '💳',
  credit: '💳',
  savings: '🏦',
  ewallet: '📱',
  wallet: '👛',
}
