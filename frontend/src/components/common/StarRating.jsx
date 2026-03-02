import { Star } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function StarRating({ rating = 0, max = 5, size = 16, interactive = false, onChange, className }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={cn(!interactive && 'cursor-default pointer-events-none')}
        >
          <Star
            size={size}
            className={cn(
              i < rating ? 'fill-orange-400 text-orange-400' : 'fill-none text-white/20',
              interactive && i < rating && 'hover:scale-110 transition-transform'
            )}
          />
        </button>
      ))}
    </div>
  )
}
