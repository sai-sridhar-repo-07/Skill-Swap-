import { useParams, Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Share2, Star, BookOpen } from 'lucide-react'
import { userService, reviewService } from '../services/sessionService'
import Avatar from '../components/ui/Avatar'
import StarRating from '../components/ui/StarRating'
import Navbar from '../components/layout/Navbar'
import { LEVEL_COLORS, timeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import TeacherStatsBar from '../components/profile/TeacherStatsBar'
import ProfileCompletionRing from '../components/profile/ProfileCompletionRing'
import api from '../services/api'

const LEVEL_PCT = { Beginner: 33, Intermediate: 66, Advanced: 100 }

function SkillBar({ name, level, index }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true })
  const pct = LEVEL_PCT[level] || 33
  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="text-xs text-white/70 w-28 truncate shrink-0">{name}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 0.8, delay: index * 0.08, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #CC6A00, #FF9933)' }}
        />
      </div>
      <span className="text-[10px] text-white/35 w-20 shrink-0">{level}</span>
    </div>
  )
}

function SentimentBar({ reviews }) {
  if (!reviews?.length) return null
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))
  const max = Math.max(...counts.map((c) => c.count), 1)
  return (
    <div className="space-y-1.5 pt-2">
      {counts.map(({ star, count }) => (
        <div key={star} className="flex items-center gap-2 text-[11px]">
          <span className="text-white/35 w-3">{star}</span>
          <Star size={9} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
          <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(count / max) * 100}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FF9933, #FFB347)' }}
            />
          </div>
          <span className="text-white/25 w-4 text-right">{count}</span>
        </div>
      ))}
    </div>
  )
}

export default function Profile() {
  const { slug } = useParams()
  const { user: authUser } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['profile', slug], queryFn: () => userService.getProfileBySlug(slug),
  })
  const user = data?.data?.data?.user

  const isOwnProfile = authUser && user && authUser._id === (user._id || user.id)

  const { data: statsData } = useQuery({
    queryKey: ['stats', user?._id],
    queryFn: () => api.get(`/users/${user._id}/stats`),
    enabled: !!user?._id && isOwnProfile,
  })
  const completionPct = statsData?.data?.data?.completionPct || 0

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', user?._id],
    queryFn: () => reviewService.getUserReviews(user?._id),
    enabled: !!user?._id,
  })
  const reviews = reviewsData?.data?.data?.reviews || []

  const shareProfile = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Profile link copied! 🔗')
  }

  if (isLoading) return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="pt-20 max-w-3xl mx-auto px-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
            className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
            className="text-6xl mb-4">👤</motion.div>
          <p className="text-white/50 mb-4">Profile not found</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </motion.div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Animated gradient banner with orbs */}
          <div className="h-24 rounded-xl mb-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(255,153,51,0.2), rgba(57,73,171,0.15), rgba(255,179,71,0.1))' }}>
            <motion.div animate={{ scale: [1, 1.3, 1], x: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity }}
              className="absolute top-2 left-8 w-20 h-20 rounded-full blur-2xl opacity-50"
              style={{ background: '#FF9933' }} />
            <motion.div animate={{ scale: [1.2, 1, 1.2], x: [0, -15, 0] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }}
              className="absolute bottom-0 right-16 w-16 h-16 rounded-full blur-2xl opacity-40"
              style={{ background: '#3949AB' }} />
          </div>
          <div className="flex items-start gap-5 -mt-12 px-1">
            <div className="flex-shrink-0" style={{ outline: '3px solid #0a0a0f', borderRadius: '50%' }}>
              <Avatar src={user.avatar} name={user.name} size="xl" />
            </div>
            <div className="flex-1 min-w-0 pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white">{user.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={user.rating} size="md" />
                    <span className="text-xs text-white/35">{user.totalReviews} reviews</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOwnProfile && <ProfileCompletionRing pct={completionPct} size={72} />}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={shareProfile}
                    className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-cyan-400 transition-colors">
                    <Share2 size={17} />
                  </motion.button>
                </div>
              </div>
              {user.bio && <p className="text-white/55 text-sm mt-3 leading-relaxed">{user.bio}</p>}
            </div>
          </div>
        </motion.div>

        {/* Teacher Stats */}
        {user._id && <TeacherStatsBar userId={user._id} />}

        {/* Skills I Teach */}
        {user.skillsOffered?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card space-y-4" style={{ border: '1px solid rgba(255,153,51,0.15)' }}>
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={12} className="text-orange-300" /> Skills I Teach
            </h2>
            <div className="space-y-2.5">
              {user.skillsOffered.map((s, i) => (
                <SkillBar key={s.name} name={s.name} level={s.level} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Skills Wanted */}
        {user.skillsWanted?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card space-y-3" style={{ border: '1px solid rgba(255,153,51,0.15)' }}>
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
              <Star size={12} className="text-cyan-400" /> Wants to Learn
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.skillsWanted.map((s, i) => (
                <motion.span key={s.name || s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.04 }}
                  className="pill-ocean text-xs">{s.name || s}</motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            Reviews
            <span className="pill-purple text-xs">{reviews.length}</span>
          </h2>
          {reviews.length > 0 && <SentimentBar reviews={reviews} />}
          {reviews.length === 0 ? (
            <div className="card text-center py-10 text-white/30 text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-3xl mb-2">🌟</div>
              No reviews yet
            </div>
          ) : (
            reviews.map((r, i) => (
              <motion.div key={r._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card !p-4 flex gap-3" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <Avatar src={r.reviewerId?.avatar} name={r.reviewerId?.name} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{r.reviewerId?.name}</p>
                    <StarRating rating={r.rating} size="sm" />
                    <span className="text-[10px] text-white/25 ml-auto">{timeAgo(r.createdAt)}</span>
                  </div>
                  {r.sessionId && (
                    <p className="text-[10px] text-cyan-400 mt-0.5 truncate">Session: {r.sessionId.title}</p>
                  )}
                  {r.comment && <p className="text-xs text-white/50 mt-1">{r.comment}</p>}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
