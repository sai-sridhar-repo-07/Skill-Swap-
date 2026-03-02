import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  lime:      'btn-lime',
  ocean:     'btn-ocean',
  ghost:     'btn-ghost',
}
const sizes = {
  sm: '!px-3 !py-1.5 !text-sm !rounded-lg',
  md: '',
  lg: '!px-8 !py-4 !text-lg',
}

export default function Button({ children, variant = 'primary', size = 'md', className, loading, icon, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: props.disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: props.disabled || loading ? 1 : 0.97 }}
      className={cn(variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2 justify-center">
          <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
          </svg>
          Loading…
        </span>
      ) : (
        <span className="flex items-center gap-2 justify-center">{icon && icon}{children}</span>
      )}
    </motion.button>
  )
}
