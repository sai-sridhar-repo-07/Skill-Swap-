import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api'

const STATES = {
  loading: { icon: '⏳', title: 'Verifying…',        desc: 'Please wait a moment.',           pill: 'pill-ocean',  btn: 'btn-secondary' },
  success: { icon: '✅', title: 'Email Verified!',    desc: 'You can now access all features.', pill: 'pill-lime',   btn: 'btn-primary' },
  error:   { icon: '❌', title: 'Verification Failed', desc: 'Token is invalid or expired.',    pill: 'pill-fire',   btn: 'btn-primary' },
}

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  const s = STATES[status]

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ background: status === 'success' ? '#FF9933' : status === 'error' ? '#FF9933' : '#FF9933' }} />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="card !p-8 text-center max-w-sm w-full relative overflow-hidden"
        style={{ border: status === 'success' ? '1px solid rgba(255,153,51,0.25)' : status === 'error' ? '1px solid rgba(255,153,51,0.25)' : '1px solid rgba(255,153,51,0.2)' }}>
        <div className="absolute top-0 inset-x-0 h-0.5"
          style={{ background: status === 'success' ? 'linear-gradient(90deg, #CC5200, #FF8C00)' : status === 'error' ? 'linear-gradient(90deg, #E65C00, #FFAD5C)' : 'linear-gradient(90deg, #E65C00, #FF8C00)' }} />

        <motion.div
          animate={status === 'loading' ? { rotate: 360 } : { y: [0, -6, 0] }}
          transition={status === 'loading' ? { duration: 1.5, repeat: Infinity, ease: 'linear' } : { duration: 2, repeat: Infinity }}
          className="text-5xl mb-4 inline-block">{s.icon}</motion.div>

        <h1 className="text-xl font-black text-white mb-2">{s.title}</h1>
        <p className="text-white/45 text-sm mb-6">{s.desc}</p>

        <Link to={status === 'success' ? '/dashboard' : '/register'}
          className={`${s.btn} inline-block px-6 py-2.5`}>
          {status === 'success' ? 'Go to Dashboard 🚀' : 'Try Again'}
        </Link>
      </motion.div>
    </div>
  )
}
