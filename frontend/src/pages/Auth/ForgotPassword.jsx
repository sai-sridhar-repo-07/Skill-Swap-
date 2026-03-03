import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Mail, ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Background orb */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF9933 0%, transparent 70%)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative">
        <div className="card !p-8 space-y-6 relative overflow-hidden"
          style={{ border: '1px solid rgba(255,153,51,0.2)' }}>
          {/* Top accent */}
          <div className="absolute top-0 inset-x-0 h-0.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, #E65C00, #FF9933, #FF8C00)' }} />

          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255,153,51,0.12)', border: '1px solid rgba(255,153,51,0.25)' }}>
              <Mail size={28} className="text-coral-400" style={{ color: '#FF9933' }} />
            </motion.div>
            <h1 className="text-2xl font-black text-white">Reset password</h1>
            <p className="text-white/45 text-sm mt-1">We'll send you a reset link</p>
          </div>

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl">📬</motion.div>
              <p className="text-white/60 text-sm">Check your inbox for the reset link. It expires in 1 hour.</p>
              <Link to="/login" className="btn-secondary inline-block px-6 py-2.5 text-sm">Back to login</Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email address" type="email" placeholder="you@example.com"
                icon={<Mail size={15} />}
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })} />
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                type="submit" disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-50">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </motion.button>
            </form>
          )}

          <p className="text-center text-sm text-white/40">
            <Link to="/login"
              className="hover:text-white transition-colors flex items-center justify-center gap-1">
              <ArrowLeft size={13} /> Back to login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
