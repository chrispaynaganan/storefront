import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(amount: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(date))
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

export function truncate(text: string, length = 100) {
  return text.length > length ? text.slice(0, length) + '…' : text
}
