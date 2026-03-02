import { getInitials } from '../../utils/helpers'

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

// Indian flag — saffron + navy gradients, deterministic per name
const GRADIENTS = [
  { from: '#CC5200', to: '#FF8C00' },  // deep saffron
  { from: '#FF6B00', to: '#FFAD5C' },  // warm saffron
  { from: '#1a237e', to: '#3949ab' },  // Ashoka navy
  { from: '#E65C00', to: '#FF8C00' },  // saffron
  { from: '#283593', to: '#5c6bc0' },  // medium navy
  { from: '#FF6B00', to: '#FFB347' },  // light saffron
]
const getGradient = (name) => GRADIENTS[(name?.charCodeAt(0) || 0) % GRADIENTS.length]

export default function Avatar({ src, name, size = 'md', className = '' }) {
  if (src) return (
    <img src={src} alt={name || 'avatar'}
      className={`${sizes[size]} rounded-full object-cover ring-2 ring-orange-500/20 flex-shrink-0 ${className}`} />
  )
  const g = getGradient(name)
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-black flex-shrink-0 ${className}`}
      style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})`, color: 'var(--bg-primary)' }}>
      {getInitials(name)}
    </div>
  )
}
