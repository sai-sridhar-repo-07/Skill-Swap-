import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, BookOpen, Zap, TrendingUp, Shield, ArrowRight, Activity } from 'lucide-react'
import { adminService } from '../../services/sessionService'
import { Skeleton } from '../../components/ui/Skeleton'
import Avatar from '../../components/ui/Avatar'
import { timeAgo, formatCredits } from '../../utils/helpers'

const STAT_CARDS = (d) => [
  { icon: <Users size={18}/>, label: 'Total Users',      value: d?.stats?.totalUsers || 0,
    grad: 'linear-gradient(135deg, rgba(255,173,92,0.1), rgba(255,107,0,0.08))', accent: '#FF6B00', dot: 'bg-cyan-400' },
  { icon: <BookOpen size={18}/>, label: 'Total Sessions', value: d?.stats?.totalSessions || 0,
    grad: 'linear-gradient(135deg, rgba(255,107,0,0.12), rgba(255,119,0,0.08))', accent: '#FF6B00', dot: 'bg-coral-400' },
  { icon: <TrendingUp size={18}/>, label: 'Completed',   value: d?.stats?.completedSessions || 0,
    grad: 'linear-gradient(135deg, rgba(255,107,0,0.12), rgba(255,119,0,0.08))', accent: '#FF6B00', dot: 'bg-lime-400' },
  { icon: <Zap size={18}/>, label: 'Credits Issued',     value: formatCredits(d?.stats?.totalCreditsInSystem),
    grad: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,173,92,0.06))', accent: '#ffffff', dot: 'bg-yellow-400' },
]

const STATUS_PILL = { live: 'pill-fire', upcoming: 'pill-ocean', completed: 'pill-purple', cancelled: 'pill-pink' }

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'], queryFn: () => adminService.getDashboard(),
  })
  const d = data?.data?.data

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Shield size={20} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            <p className="text-white/40 text-xs">Platform overview and management</p>
          </div>
          <div className="ml-auto pill-fire flex items-center gap-1.5 text-xs">
            <Activity size={10} /> Live
          </div>
        </motion.div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STAT_CARDS(d).map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card relative overflow-hidden" style={{ background: s.grad, border: `1px solid ${s.accent}22` }}>
                <div className={`w-2 h-2 rounded-full absolute top-3 right-3 ${s.dot}`} />
                <div className="mb-2" style={{ color: s.accent }}>{s.icon}</div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="card" style={{ border: '1px solid rgba(255,107,0,0.12)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={14} className="text-cyan-400" /> Recent Users
              </h2>
              <Link to="/admin/users"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                Manage <ArrowRight size={11}/>
              </Link>
            </div>
            <div className="space-y-3">
              {(d?.recentUsers || []).map((u, i) => (
                <motion.div key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/4 transition-colors">
                  <Avatar src={u.avatar} name={u.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                    <p className="text-xs text-white/35 truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-white/25 flex-shrink-0">{timeAgo(u.createdAt)}</span>
                </motion.div>
              ))}
              {!d?.recentUsers?.length && (
                <p className="text-center text-white/25 text-sm py-6">No users yet</p>
              )}
            </div>
          </motion.div>

          {/* Recent Sessions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="card" style={{ border: '1px solid rgba(255,107,0,0.12)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen size={14} className="text-coral-400" /> Recent Sessions
              </h2>
            </div>
            <div className="space-y-3">
              {(d?.recentSessions || []).map((s, i) => (
                <motion.div key={s._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/4 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{s.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] ${STATUS_PILL[s.status] || 'pill-ocean'}`}>{s.status}</span>
                      <span className="text-[10px] text-white/30 truncate">{s.hostId?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-yellow-400 flex-shrink-0 font-bold">
                    <Zap size={10} className="fill-yellow-400" />{s.creditCost}
                  </div>
                </motion.div>
              ))}
              {!d?.recentSessions?.length && (
                <p className="text-center text-white/25 text-sm py-6">No sessions yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
