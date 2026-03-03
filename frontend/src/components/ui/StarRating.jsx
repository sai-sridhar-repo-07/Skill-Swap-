import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function StarRating({ rating = 0, max = 5, onChange, size = 'sm' }) {
  const sz = size === 'sm' ? 13 : size === 'md' ? 18 : 22
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <motion.div key={i} whileHover={onChange ? { scale: 1.3 } : {}}>
          <Star
            size={sz}
            className={cn(
              'transition-all duration-150',
              i < Math.round(rating) ? 'fill-orange-400 text-orange-400 drop-shadow-[0_0_4px_rgba(255,153,51,0.7)]' : 'text-white/15',
              onChange && 'cursor-pointer hover:text-orange-300'
            )}
            onClick={() => onChange?.(i + 1)}
          />
        </motion.div>
      ))}
      {!onChange && rating > 0 && (
        <span className="ml-1 text-[11px] text-white/40 font-medium">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  )
}
