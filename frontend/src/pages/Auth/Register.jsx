import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { User, Mail, Lock, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    const result = await registerUser(data.name, data.email, data.password)
    if (result.success) { toast.success('Welcome to SkillSwap! 🎉'); navigate('/dashboard') }
    else toast.error(result.message)
  }

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: User,
      rules: { required: 'Name required', minLength: { value: 2, message: 'Min 2 chars' } } },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: Mail,
      rules: { required: 'Email required' } },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 characters', icon: Lock,
      rules: { required: 'Password required', minLength: { value: 8, message: 'Min 8 chars' } } },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', icon: Lock,
      rules: { validate: (v) => v === password || 'Passwords do not match' } },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF9933, transparent)' }} />
        <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, delay: 3 }}
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FFAD5C, transparent)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md">
        <div className="card !p-8 space-y-6" style={{ border: '1px solid rgba(255,153,51,0.2)', background: 'rgba(255,255,255,0.035)' }}>
          <div className="text-center">
            <Link to="/" className="inline-block mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white mx-auto shadow-glow-fire"
                style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>S</div>
            </Link>
            <h1 className="text-2xl font-black text-white">Create your account</h1>
            <p className="text-white/40 text-sm mt-1">Start your learning journey today</p>
            <motion.div whileHover={{ scale: 1.02 }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-orange-300"
              style={{ background: 'rgba(255,153,51,0.1)', border: '1px solid rgba(255,153,51,0.25)' }}>
              <Sparkles size={14} /> Get 10 free credits on signup!
            </motion.div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {fields.map(({ name, label, type, placeholder, icon: Icon, rules }) => (
              <div key={name}>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                  <input type={type} placeholder={placeholder}
                    className={`input pl-10 ${errors[name] ? 'border-coral-500/60' : ''}`}
                    {...register(name, rules)} />
                </div>
                {errors[name] && <p className="text-xs text-coral-400 mt-0.5">{errors[name].message}</p>}
              </div>
            ))}

            <motion.button type="submit" disabled={isLoading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3.5 mt-2">
              {isLoading ? 'Creating…' : 'Create Free Account 🚀'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-coral-400 hover:text-coral-300 font-bold">Sign in →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
