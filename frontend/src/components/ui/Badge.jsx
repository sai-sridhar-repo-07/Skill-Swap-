import { cn } from '../../utils/helpers'

const variants = {
  default:   'bg-white/8 text-white/50',
  brand:     'pill-fire',
  success:   'pill-lime',
  warning:   'pill-yellow',
  danger:    'pill-fire',
  info:      'pill-ocean',
  live:      'pill-lime',
  ocean:     'pill-ocean',
  pink:      'pill-pink',
  purple:    'pill-purple',
}

export default function Badge({ children, variant = 'default', className }) {
  return <span className={cn('badge', variants[variant], className)}>{children}</span>
}
