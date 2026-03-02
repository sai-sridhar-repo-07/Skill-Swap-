import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast } from 'date-fns'

export const cn = (...args) => twMerge(clsx(...args))
export const formatDate     = (d) => format(new Date(d), 'MMM d, yyyy')
export const formatTime     = (d) => format(new Date(d), 'h:mm a')
export const formatDateTime = (d) => format(new Date(d), 'MMM d, yyyy h:mm a')
export const timeAgo        = (d) => formatDistanceToNow(new Date(d), { addSuffix: true })
export const isSessionPast  = (d) => isPast(new Date(d))

export const LEVEL_COLORS = {
  Beginner:     'pill-lime',
  Intermediate: 'pill-yellow',
  Advanced:     'pill-fire',
}
export const STATUS_COLORS = {
  upcoming:  'pill-ocean',
  live:      'pill-lime',
  completed: 'bg-white/8 text-white/40 px-2.5 py-0.5 rounded-full text-xs font-semibold',
  cancelled: 'pill-fire',
  draft:     'pill-yellow',
}

export const SKILL_CATEGORIES = [
  'Programming','Design','Marketing','Music','Languages',
  'Photography','Business','Writing','Data Science','Art','Other',
]
export const truncate       = (str, n = 100) => str?.length > n ? str.slice(0, n) + '…' : str
export const getInitials    = (name) => name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
export const formatCredits  = (n) => n !== undefined && n !== null ? Number(n).toFixed(0) : '0'
