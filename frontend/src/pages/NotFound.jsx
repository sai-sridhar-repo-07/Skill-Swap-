import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1,1.2,1], rotate: [0,90,0] }} transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF9933, transparent)' }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-center relative">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
          className="text-[120px] font-black leading-none mb-4"
          style={{ background: 'linear-gradient(135deg, #FF9933, #FFAD5C, #FF9933)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          404
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-white/40 text-sm mb-8">This page got lost in the skill exchange</p>
        <Link to="/" className="btn-primary">Go Home 🏠</Link>
      </motion.div>
    </div>
  )
}
