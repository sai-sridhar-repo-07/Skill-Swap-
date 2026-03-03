import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Star, TrendingUp, Shield, Video, BarChart3, Zap } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const BENEFITS = [
  { icon: Star,       text: 'Priority listing in search results' },
  { icon: TrendingUp, text: 'Detailed earnings & session analytics' },
  { icon: Shield,     text: 'Verified Teacher badge on your profile' },
  { icon: Video,      text: 'Unlimited session creation (free users: 3/month)' },
  { icon: BarChart3,  text: 'Student retention & skill performance insights' },
  { icon: Zap,        text: 'Early access to new platform features' },
]

export default function SubscribeTeacher() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const cancelled = params.get('sub') === 'cancelled'

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await api.post('/payments/subscribe')
      window.location.href = res.data.url
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start subscription checkout')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">

        {cancelled && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-xl text-sm text-yellow-300"
            style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
            Subscription was cancelled — no charge was made. You can subscribe anytime below.
          </motion.div>
        )}

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,107,0,0.25)' }}>

          {/* Header gradient */}
          <div className="p-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(204,82,0,0.3) 0%, rgba(57,73,171,0.2) 100%)' }}>
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>
              <Star size={28} className="text-white fill-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Teacher Subscription</h1>
            <p className="text-white/60 text-sm">Unlock the full SkillSwap teaching experience</p>
            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-white">$5</span>
              <span className="text-white/50 text-sm">/month</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="p-6 space-y-3" style={{ background: '#0f1523' }}>
            {BENEFITS.map(({ icon: Icon, text }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,107,0,0.12)' }}>
                  <Icon size={14} className="text-orange-400" />
                </div>
                <span className="text-sm text-white/80">{text}</span>
                <CheckCircle size={14} className="text-green-400 ml-auto flex-shrink-0" />
              </motion.div>
            ))}

            <div className="pt-4 space-y-3">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-60 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)', boxShadow: '0 4px 20px rgba(255,107,0,0.3)' }}>
                {loading ? 'Redirecting to checkout…' : 'Subscribe for $5/month'}
              </button>

              <button onClick={() => navigate('/dashboard')}
                className="w-full py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors">
                Not now — go back
              </button>
            </div>

            <p className="text-center text-[11px] text-white/25 pt-2">
              Cancel anytime from your Dashboard · Powered by Stripe
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
