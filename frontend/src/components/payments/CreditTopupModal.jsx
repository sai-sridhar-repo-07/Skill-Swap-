import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Star } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PACKS = [
  { id: '10c',  credits: 10,  price: '$2',  label: 'Starter' },
  { id: '25c',  credits: 25,  price: '$4',  label: 'Popular' },
  { id: '50c',  credits: 50,  price: '$7',  label: 'Best Value', highlight: true },
  { id: '100c', credits: 100, price: '$12', label: 'Power User' },
]

export default function CreditTopupModal({ onClose }) {
  const [selected, setSelected] = useState('50c')
  const [loading, setLoading]   = useState(false)

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const res = await api.post('/payments/checkout', { pack: selected })
      window.location.href = res.data.url
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create checkout session')
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}>

        <motion.div
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-2xl p-6 relative"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
          onClick={(e) => e.stopPropagation()}>

          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Zap size={20} className="text-orange-400" />
            <h2 className="text-lg font-bold text-white">Buy Credits</h2>
          </div>
          <p className="text-sm text-white/50 mb-5">Credits are used to book live sessions with teachers.</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {PACKS.map((pack) => (
              <button key={pack.id}
                onClick={() => setSelected(pack.id)}
                className="relative p-4 rounded-xl text-left transition-all"
                style={{
                  background: selected === pack.id
                    ? 'linear-gradient(135deg, rgba(204,82,0,0.25), rgba(255,140,0,0.15))'
                    : 'rgba(255,255,255,0.04)',
                  border: selected === pack.id
                    ? '1.5px solid rgba(255,153,51,0.6)'
                    : '1.5px solid rgba(255,255,255,0.08)',
                }}>
                {pack.highlight && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1"
                    style={{ background: 'linear-gradient(135deg, #CC6A00, #FF9933)' }}>
                    <Star size={8} className="fill-white" /> Best Value
                  </span>
                )}
                <div className="text-2xl font-black text-white">{pack.credits}</div>
                <div className="text-xs text-white/50">credits</div>
                <div className="mt-2 text-base font-bold text-orange-400">{pack.price}</div>
                <div className="text-[11px] text-white/40">{pack.label}</div>
              </button>
            ))}
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #CC6A00, #FF9933)' }}>
            {loading ? 'Redirecting to checkout…' : `Purchase ${PACKS.find(p => p.id === selected)?.credits} Credits`}
          </button>

          <p className="text-center text-[11px] text-white/30 mt-3">Powered by Stripe · Secure checkout</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
