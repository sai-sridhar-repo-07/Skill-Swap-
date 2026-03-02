import { getInitials } from '../../utils/helpers'
import { cn } from '../../utils/helpers'

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl',
}

export default function Avatar({ src, name, size = 'md', className, online }) {
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div className={cn('rounded-full overflow-hidden flex items-center justify-center bg-gradient-brand', sizeMap[size])}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-semibold text-white">{getInitials(name)}</span>
        )}
      </div>
      {online !== undefined && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full border-2 border-dark-900',
          'w-3 h-3',
          online ? 'bg-emerald-400' : 'bg-gray-500'
        )} />
      )}
    </div>
  )
}
