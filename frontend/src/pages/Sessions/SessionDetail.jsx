import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Users, Zap, Calendar, Share2, Bookmark, ArrowLeft, Video, Star } from 'lucide-react'
import { sessionService, reviewService, userService } from '../../services/sessionService'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import Modal from '../../components/ui/Modal'
import Navbar from '../../components/layout/Navbar'
import { LEVEL_COLORS, STATUS_COLORS, formatDateTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const STATUS_PILL = {
  live:      'pill-fire',
  upcoming:  'pill-ocean',
  completed: 'pill-purple',
  cancelled: 'pill-pink',
}

export default function SessionDetail() {
  const { id } = useParams()
  const { user, isAuthenticated, refreshUser } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })
  const [cancelModal, setCancelModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['session', id], queryFn: () => sessionService.getById(id),
  })
  const session = data?.data?.data?.session

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', session?.hostId?._id],
    queryFn: () => reviewService.getUserReviews(session?.hostId?._id),
    enabled: !!session?.hostId?._id,
  })
  const reviews = reviewsData?.data?.data?.reviews || []

  const bookMutation = useMutation({
    mutationFn: () => sessionService.book(id),
    onSuccess: () => {
      toast.success('🎉 Session booked! Credits deducted.')
      qc.invalidateQueries(['session', id])
      refreshUser()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Booking failed'),
  })

  const cancelMutation = useMutation({
    mutationFn: () => sessionService.cancel(id, 'Host cancelled'),
    onSuccess: () => {
      toast.success('Session cancelled. Credits refunded.')
      qc.invalidateQueries(['session', id])
      setCancelModal(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cancel failed'),
  })

  const reviewMutation = useMutation({
    mutationFn: () => reviewService.create(id, reviewData),
    onSuccess: () => {
      toast.success('Review submitted! ⭐')
      setReviewModal(false)
      qc.invalidateQueries(['reviews'])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Review failed'),
  })

  const bookmarkMutation = useMutation({
    mutationFn: () => userService.toggleBookmark(id),
    onSuccess: ({ data }) => toast.success(data.data.bookmarked ? 'Saved! 🔖' : 'Removed'),
  })

  if (isLoading) return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="pt-20 max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
            className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  )

  if (!session) return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-white/50 mb-4">Session not found</p>
          <Link to="/sessions" className="btn-primary">Browse sessions</Link>
        </motion.div>
      </div>
    </div>
  )

  const myId = user?._id?.toString()
  const isHost = myId && myId === session.hostId?._id?.toString()
  const isBooked = session.bookedUsers?.some((u) =>
    (u._id?.toString() || u?.toString()) === myId
  )
  const isLive = session.status === 'live'
  const isUpcoming = session.status === 'upcoming'
  const seatsLeft = session.maxSeats - (session.bookedUsers?.length || 0)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/sessions"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to sessions
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start gap-2 flex-wrap">
                  <span className={`pill-fire text-xs ${STATUS_PILL[session.status] || 'pill-fire'}`}>
                    {session.status === 'live' ? '🔴 Live Now' : session.status}
                  </span>
                  <span className={`text-xs ${LEVEL_COLORS[session.level]}`}>{session.level}</span>
                  <span className="pill-ocean text-xs">#{session.skillTag}</span>
                </div>
                <h1 className="text-2xl font-bold text-white leading-snug">{session.title}</h1>
                <p className="text-white/55 leading-relaxed">{session.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-white/45 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-cyan-400" />{session.duration} minutes</span>
                  <span className="flex items-center gap-1.5"><Users size={14} className="text-orange-300" />{session.maxSeats} max seats</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-pink-400" />{formatDateTime(session.startTime)}</span>
                </div>
              </motion.div>

              {/* Host card */}
              {session.hostId && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="card flex items-start gap-4"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Avatar src={session.hostId.avatar} name={session.hostId.name} size="lg" />
                  <div className="flex-1">
                    <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Your instructor</p>
                    <h3 className="text-lg font-bold text-white">{session.hostId.name}</h3>
                    <StarRating rating={session.hostId.rating} size="sm" />
                    <p className="text-sm text-white/50 mt-2 leading-relaxed line-clamp-3">{session.hostId.bio}</p>
                    {session.hostId.skillsOffered?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {session.hostId.skillsOffered.slice(0, 5).map((s, i) => (
                          <motion.span key={s.name} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                            className={`text-[10px] ${LEVEL_COLORS[s.level]}`}>{s.name}</motion.span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Reviews */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" /> Reviews
                  <span className="pill-purple text-xs">{reviews.length}</span>
                </h2>
                {reviews.length === 0 ? (
                  <div className="card text-center py-8 text-white/30 text-sm" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    No reviews yet — be the first!
                  </div>
                ) : (
                  reviews.map((r, i) => (
                    <motion.div key={r._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card !p-4 flex gap-3" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Avatar src={r.reviewerId?.avatar} name={r.reviewerId?.name} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{r.reviewerId?.name}</p>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                        <p className="text-xs text-white/50 mt-1">{r.comment}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>

            {/* Booking sidebar */}
            <div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className="card space-y-4 sticky top-20"
                style={{ border: '1px solid rgba(255,153,51,0.2)', background: 'rgba(255,153,51,0.03)' }}>
                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                      <Zap size={22} className="text-yellow-400 fill-yellow-400" />
                    </motion.div>
                    <span className="text-3xl font-black text-white">{session.creditCost}</span>
                    <span className="text-white/40 text-sm">credits</span>
                  </div>
                  <div className="flex gap-1">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => bookmarkMutation.mutate()}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-pink-400 transition-colors">
                      <Bookmark size={17} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-cyan-400 transition-colors">
                      <Share2 size={17} />
                    </motion.button>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2 text-sm py-2 border-y border-white/8">
                  <div className="flex justify-between text-white/50">
                    <span>Duration</span><span className="text-white font-medium">{session.duration} min</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Seats left</span>
                    <span className={`font-medium ${seatsLeft === 0 ? 'text-coral-400' : seatsLeft <= 2 ? 'text-yellow-400' : 'text-orange-300'}`}>
                      {seatsLeft}/{session.maxSeats}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Type</span><span className="text-white font-medium capitalize">{session.sessionType}</span>
                  </div>
                </div>

                {/* CTA */}
                {!isAuthenticated ? (
                  <Link to="/login" className="btn-primary w-full text-center block">Sign in to Book</Link>
                ) : isHost ? (
                  <div className="space-y-2">
                    {(isLive || isUpcoming) && (
                      <Link to={`/sessions/${id}/room`}
                        className="btn-primary w-full text-center flex items-center justify-center gap-2">
                        <Video size={15} />{isLive ? 'Enter Room' : 'Go to Room'}
                      </Link>
                    )}
                    {isUpcoming && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setCancelModal(true)}
                        className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all">
                        Cancel Session
                      </motion.button>
                    )}
                  </div>
                ) : isBooked ? (
                  <div className="space-y-2">
                    {(isLive || isUpcoming) && (
                      <Link to={`/sessions/${id}/room`}
                        className="btn-primary w-full text-center flex items-center justify-center gap-2">
                        <Video size={15} />{isLive ? '🔴 Join Now' : 'Join Room'}
                      </Link>
                    )}
                    {session.status === 'completed' && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setReviewModal(true)}
                        className="btn-secondary w-full text-sm">
                        Leave Review ⭐
                      </motion.button>
                    )}
                    <p className="text-center text-xs text-orange-300 flex items-center justify-center gap-1">
                      ✓ You're booked
                    </p>
                  </div>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => bookMutation.mutate()}
                    disabled={seatsLeft === 0 || !isUpcoming || bookMutation.isPending}
                    className="btn-primary w-full disabled:opacity-40">
                    {bookMutation.isPending ? 'Booking…' :
                      seatsLeft === 0 ? 'Fully Booked' :
                      !isUpcoming ? 'Not Available' :
                      `Book for ${session.creditCost} credits`}
                  </motion.button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Leave a Review ⭐">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-white/60 mb-2">Your rating</p>
            <StarRating rating={reviewData.rating} onChange={(r) => setReviewData((d) => ({ ...d, rating: r }))} size="lg" />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Comment (optional)</label>
            <textarea className="input min-h-[100px] resize-none" placeholder="Share your experience…"
              value={reviewData.comment} onChange={(e) => setReviewData((d) => ({ ...d, comment: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setReviewModal(false)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}
              className="btn-primary px-4 py-2 text-sm">
              {reviewMutation.isPending ? 'Submitting…' : 'Submit Review'}
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Session?" size="sm">
        <p className="text-white/60 text-sm mb-6">All booked users will be refunded their credits.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setCancelModal(false)} className="btn-secondary px-4 py-2 text-sm">Keep</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
            className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all">
            {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Session'}
          </motion.button>
        </div>
      </Modal>
    </div>
  )
}
