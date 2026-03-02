import { motion } from 'framer-motion'

export default function EmptyState({ icon = '📭', title, description, action, actionLabel, variant = 'fire' }) {
  const borderMap = { fire: 'neon-border-fire', lime: 'neon-border-lime', ocean: 'neon-border-ocean', pink: 'neon-border-pink' }
  const btnMap    = { fire: 'btn-primary', lime: 'btn-lime', ocean: 'btn-ocean', pink: 'btn-primary' }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`card text-center py-16 flex flex-col items-center gap-4 ${borderMap[variant]}`}>
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
        className="text-5xl">{icon}</motion.div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      {description && <p className="text-white/40 max-w-sm text-sm">{description}</p>}
      {action && (
        <button onClick={action} className={`${btnMap[variant]} mt-2`}>{actionLabel}</button>
      )}
    </motion.div>
  )
}
