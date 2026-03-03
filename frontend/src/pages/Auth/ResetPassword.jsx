import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Lock } from 'lucide-react'
import api from '../../services/api'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async ({ password }) => {
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      toast.success('Password reset! 🎉 Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired token')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card text-center p-8 max-w-sm"
        style={{ border: '1px solid rgba(255,153,51,0.2)' }}>
        <div className="text-4xl mb-3">❌</div>
        <p className="text-white/60 mb-4">Invalid reset link.</p>
        <Link to="/forgot-password" className="btn-primary">Request new link</Link>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Background orb */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF9933 0%, transparent 70%)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative">
        <div className="card !p-8 space-y-6 relative overflow-hidden"
          style={{ border: '1px solid rgba(255,153,51,0.2)' }}>
          <div className="absolute top-0 inset-x-0 h-0.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, #E65C00, #FF9933, #FF8C00)' }} />

          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255,153,51,0.1)', border: '1px solid rgba(255,153,51,0.25)' }}>
              <Lock size={28} style={{ color: '#FF9933' }} />
            </motion.div>
            <h1 className="text-2xl font-black text-white">New password</h1>
            <p className="text-white/45 text-sm mt-1">Choose a strong password</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="New Password" type="password" placeholder="Min 8 characters"
              icon={<Lock size={15} />}
              error={errors.password?.message}
              {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password"
              icon={<Lock size={15} />}
              error={errors.confirm?.message}
              {...register('confirm', { validate: (v) => v === watch('password') || 'Passwords do not match' })} />
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              type="submit" disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? 'Resetting…' : 'Reset Password'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
