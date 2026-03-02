import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, ArrowRight, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { sessionService, userService } from '../services/sessionService'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import SessionCard from '../components/session/SessionCard'
import { Skeleton } from '../components/ui/Skeleton'
import { formatCredits, formatDate, timeAgo } from '../utils/helpers'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
}

const STATS = (user, hosted, booked) => [
  { icon: '⚡', label: 'Credits Balance', value: formatCredits(user?.creditsBalance), sub: 'Available to spend',
    gradient: 'linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,107,0,0.05))',
    border: 'rgba(255,255,255,0.25)', valueColor: 'text-yellow-400' },
  { icon: '🎓', label: 'Teaching', value: hosted.length, sub: 'Sessions hosted',
    gradient: 'linear-gradient(135deg,rgba(255,107,0,0.15),rgba(255,173,92,0.05))',
    border: 'rgba(255,107,0,0.25)', valueColor: 'text-coral-400' },
  { icon: '📚', label: 'Learning', value: booked.length, sub: 'Sessions attended',
    gradient: 'linear-gradient(135deg,rgba(255,107,0,0.15),rgba(255,255,255,0.05))',
    border: 'rgba(255,107,0,0.25)', valueColor: 'text-cyan-400' },
  { icon: '⭐', label: 'Rating', value: user?.rating > 0 ? Number(user.rating).toFixed(1) : '—',
    sub: `${user?.totalReviews || 0} reviews`,
    gradient: 'linear-gradient(135deg,rgba(255,107,0,0.15),rgba(255,107,0,0.05))',
    border: 'rgba(255,107,0,0.25)', valueColor: 'text-orange-300' },
]

export default function Dashboard() {
  const { user, refreshUser } = useAuthStore()
  const { data: hostedData, isLoading: loadingHosted } = useQuery({ queryKey: ['myHosted'], queryFn: () => sessionService.getMyHosted() })
  const { data: bookedData, isLoading: loadingBooked } = useQuery({ queryKey: ['myBooked'], queryFn: () => sessionService.getMyBooked() })
  const { data: txData } = useQuery({ queryKey: ['transactions'], queryFn: () => userService.getTransactions({ limit: 5 }) })
  useEffect(() => { refreshUser() }, [])

  const hosted       = hostedData?.data?.data?.sessions || []
  const booked       = bookedData?.data?.data?.sessions || []
  const transactions = txData?.data?.data?.transactions || []
  const upcoming     = booked.filter((s) => s.status === 'upcoming').slice(0, 3)
  const completed    = [...hosted, ...booked].filter((s) => s.status === 'completed')

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      sessions: completed.filter(s => formatDate(s.actualEndTime || s.endTime) === formatDate(d)).length,
    }
  })

  const stats = STATS(user, hosted, booked)

  return (
    <motion.div initial="hidden" animate="visible" className="page-container space-y-8">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">
            Hey, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-white/40 mt-1 text-sm">Here's your learning command center</p>
        </div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link to="/sessions/create" className="btn-primary flex items-center gap-2 hidden sm:flex">
            <Plus size={17} /> New Session
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} custom={i + 1}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="card rounded-2xl overflow-hidden"
            style={{ background: s.gradient, borderColor: s.border, borderWidth: '1px' }}>
            <div className="flex items-center justify-between mb-3">
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className="text-2xl">{s.icon}</motion.span>
              <span className={`text-2xl font-black ${s.valueColor}`}>{s.value}</span>
            </div>
            <p className="text-sm font-semibold text-white/80">{s.label}</p>
            <p className="text-xs text-white/35 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Transactions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} custom={5} className="lg:col-span-2 card">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-coral-400" /> Sessions This Week
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#FF6B00" stopOpacity={0.4} />
                  <stop offset="50%"  stopColor="#FFAD5C" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '12px', color: '#fff', fontSize: 12 }}
                cursor={{ stroke: 'rgba(255,107,0,0.3)', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="sessions" stroke="#FF6B00" strokeWidth={2.5} fill="url(#gradC)" dot={{ r: 4, fill: '#FF6B00', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#FFAD5C' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Credits Feed */}
        <motion.div variants={fadeUp} custom={6} className="card">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-400">⚡</span> Credit Activity
          </h2>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-white/25 text-sm text-center py-6">No transactions yet</p>
            ) : (
              transactions.map((tx, i) => (
                <motion.div key={tx.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-medium text-white/65 capitalize">{tx.type.replace('_', ' ')}</p>
                    <p className="text-[10px] text-white/25">{timeAgo(tx.created_at)}</p>
                  </div>
                  <motion.span
                    initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 + 0.2, type: 'spring' }}
                    className={`text-sm font-black ${Number(tx.amount) > 0 ? 'text-orange-300' : 'text-coral-400'}`}>
                    {Number(tx.amount) > 0 ? '+' : ''}{Number(tx.amount).toFixed(0)}
                  </motion.span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Sessions */}
      <motion.div variants={fadeUp} custom={7}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white">Upcoming Sessions</h2>
          <Link to="/sessions" className="btn-ghost text-sm">Browse more <ArrowRight size={14} /></Link>
        </div>
        {loadingBooked ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56" />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="card text-center py-12 neon-border-ocean">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-white/40 text-sm mb-4">No upcoming sessions booked</p>
            <Link to="/sessions" className="btn-ocean inline-flex text-sm py-2.5 px-5">Find Sessions</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <SessionCard session={s} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Hosted Sessions */}
      {hosted.length > 0 && (
        <motion.div variants={fadeUp} custom={8}>
          <h2 className="text-xl font-black text-white mb-4">My Sessions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hosted.slice(0, 3).map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <SessionCard session={s} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
