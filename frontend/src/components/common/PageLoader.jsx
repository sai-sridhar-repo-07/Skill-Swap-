import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full opacity-20"
            style={{ background: 'conic-gradient(from 0deg, #CC5200, #FF9933, #FF8C00, #FFAD5C, #CC5200)' }} />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-1 rounded-full"
            style={{ background: 'var(--bg-primary)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>S</div>
          </div>
        </motion.div>
        {/* Dot trail */}
        <div className="flex gap-1.5">
          {[0,1,2].map((i) => (
            <motion.div key={i}
              animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full"
              style={{ background: ['#E65C00', '#FF9933', '#FF8C00'][i] }} />
          ))}
        </div>
      </div>
    </div>
  )
}
