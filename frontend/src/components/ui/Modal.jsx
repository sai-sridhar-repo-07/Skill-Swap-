import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 350 }}
            className={`relative w-full ${sizes[size]} rounded-2xl p-6 shadow-2xl z-10`}
            style={{ background: 'rgba(20,20,30,0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Gradient accent line */}
            <div className="absolute top-0 left-8 right-8 h-px rounded-full opacity-60"
              style={{ background: 'linear-gradient(90deg, #E65C00, #FF9933, #FF8C00)' }} />
            <div className="flex items-center justify-between mb-5">
              {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
              <button onClick={onClose}
                className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
                <X size={17} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
