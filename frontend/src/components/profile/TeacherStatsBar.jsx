import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { Star, BookOpen, Award } from 'lucide-react'
import api from '../../services/api'

function CountUp({ to, duration = 1.2 }) {
  const [val, setVal] = useState(0)
  const ref = useRef()
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return () => ctrl.stop()
  }, [inView, to])

  return <span ref={ref}>{val}</span>
}

const BADGE_COLORS = {
  'Top Rated': 'rgba(234,179,8,0.2)',
  'Power Teacher': 'rgba(139,92,246,0.2)',
  'Community Helper': 'rgba(16,185,129,0.2)',
}

export default function TeacherStatsBar({ userId }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!userId) return
    api.get(`/users/${userId}/stats`)
      .then((r) => setStats(r.data.data))
      .catch(() => {})
  }, [userId])

  if (!stats) return null

  const { sessionsCompleted, rating, totalReviews, topSkills, badges } = stats

  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* 3-column stat grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-black text-white">
            <CountUp to={sessionsCompleted} />
          </div>
          <div className="text-[11px] text-white/40 flex items-center justify-center gap-1">
            <BookOpen size={10} /> Sessions
          </div>
        </div>

        <div>
          <div className="text-2xl font-black" style={{ color: '#FF9933' }}>
            <CountUp to={parseFloat((rating || 0).toFixed(1)) * 10} duration={1.4} />
            <span className="text-base">/{totalReviews > 0 ? 50 : 0}</span>
          </div>
          <div className="text-[11px] text-white/40 flex items-center justify-center gap-1">
            <Star size={10} /> Rating × 10
          </div>
          {/* Rating bar */}
          <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(rating / 5) * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FF9933, #FF9933)' }}
            />
          </div>
        </div>

        <div>
          <div className="text-2xl font-black text-white">
            {topSkills?.[0]?.name ? (
              <span className="text-sm font-bold truncate block">{topSkills[0].name}</span>
            ) : <span>—</span>}
          </div>
          <div className="text-[11px] text-white/40">Top Skill</div>
          {topSkills?.[0]?.level && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,153,51,0.15)', color: '#FF9933' }}>
              {topSkills[0].level}
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      {badges?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {badges.map((b, i) => (
            <motion.span key={i}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              title={`Awarded ${new Date(b.awardedAt).toLocaleDateString()}`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white cursor-default"
              style={{ background: BADGE_COLORS[b.name] || 'rgba(255,255,255,0.08)' }}>
              <Award size={10} /> {b.name}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  )
}
