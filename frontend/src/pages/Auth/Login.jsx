import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password)
    if (result.success) { toast.success('Welcome back! 👋'); navigate('/dashboard') }
    else toast.error(result.message)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, rgba(255,153,51,0.12) 0%, rgba(255,179,71,0.08) 50%, rgba(255,153,51,0.08) 100%)' }}>
        <div className="absolute inset-0 bg-grid-dark opacity-50" />
        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute w-96 h-96 rounded-full opacity-10 border border-coral-500/40" />
        <motion.div animate={{ rotate: [360, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute w-64 h-64 rounded-full opacity-15 border border-lime-500/40" />
        <div className="relative text-center space-y-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl text-white mx-auto shadow-glow-fire"
            style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>S</motion.div>
          <div>
            <h2 className="text-3xl font-black text-white">SkillSwap</h2>
            <p className="text-white/40 mt-2">Peer-to-Peer Microlearning</p>
          </div>
          {/* Floating skill pills */}
          {[
            { label: 'React', color: 'pill-ocean', pos: '-top-8 -left-4', delay: 0 },
            { label: 'Guitar', color: 'pill-fire', pos: '-top-4 right-0', delay: 0.5 },
            { label: 'Python', color: 'pill-lime', pos: 'bottom-0 -left-8', delay: 1 },
            { label: 'Design', color: 'pill-pink', pos: '-bottom-6 right-4', delay: 1.5 },
          ].map((p) => (
            <motion.span key={p.label} animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: p.delay }}
              className={`absolute ${p.pos} ${p.color}`}>{p.label}</motion.span>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-black text-white">Welcome back 👋</h1>
            <p className="text-white/40 mt-1">Sign in to continue learning</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-white/60 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input type="email" placeholder="you@example.com"
                  className={`input pl-10 ${errors.email ? 'border-coral-500/60' : ''}`}
                  {...register('email', { required: 'Email is required' })} />
              </div>
              {errors.email && <p className="text-xs text-coral-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-white/60">Password</label>
                <Link to="/forgot-password" className="text-xs text-coral-400 hover:text-coral-300 transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input type={showPass ? 'text' : 'password'} placeholder="Your password"
                  className={`input pl-10 pr-10 ${errors.password ? 'border-coral-500/60' : ''}`}
                  {...register('password', { required: 'Password is required' })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-coral-400 mt-1">{errors.password.message}</p>}
            </div>

            <motion.button type="submit" disabled={isLoading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3.5 text-base mt-2">
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">Sign in <ArrowRight size={18} /></span>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-white/40">
            New to SkillSwap?{' '}
            <Link to="/register" className="text-coral-400 hover:text-coral-300 font-bold transition-colors">
              Create free account →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
