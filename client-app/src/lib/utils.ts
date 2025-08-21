import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTextWithSize = (
  text: string | undefined | null,
  length: number
) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

const formatDateIntl = (datetime: string) => {
  if (!datetime) return

  const newDate = new Date(datetime)

  const f = new Intl.DateTimeFormat('en-uk', {
    dateStyle: 'short',
    timeStyle: 'full',
  })

  return f.format(newDate).substring(0, 10)
}

const formatDate = (datetime: string) => {
  if (!datetime) return

  const newDate = new Date(datetime).toString()

  return newDate.substring(0, 10)
}

const formatTime = (datetime: string) => {
  if (!datetime) return

  const newDate = new Date(datetime).toString()

  return newDate.substring(16, 21)
}

export { formatDateIntl, formatDate, formatTime }
