import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers'

export default function Card({ children, className, hover = false, onClick, ...props }) {
  const Component = hover || onClick ? motion.div : 'div'
  const motionProps = hover || onClick ? {
    whileHover: { y: -2, boxShadow: '0 8px 40px rgba(0,0,0,0.4)' },
    transition: { duration: 0.2 },
  } : {}
  return (
    <Component
      className={cn('card', hover && 'cursor-pointer hover:bg-white/[0.08] hover:border-white/20', className)}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
}
