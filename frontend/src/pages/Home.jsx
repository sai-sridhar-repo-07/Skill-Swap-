import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Zap, Users, Star, Shield, Video, MessageSquare, Sparkles, TrendingUp, Globe } from 'lucide-react'
import { sessionService } from '../services/sessionService'
import SessionCard from '../components/session/SessionCard'
import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../store/authStore'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

const SKILL_PILLS = [
  { label: 'React', color: 'pill-ocean' }, { label: 'Guitar', color: 'pill-fire' },
  { label: 'Python', color: 'pill-lime' }, { label: 'Figma', color: 'pill-pink' },
  { label: 'SQL', color: 'pill-purple' }, { label: 'French', color: 'pill-yellow' },
  { label: 'Photography', color: 'pill-fire' }, { label: 'Trading', color: 'pill-lime' },
  { label: 'ML / AI', color: 'pill-ocean' }, { label: 'Yoga', color: 'pill-pink' },
  { label: 'Swift', color: 'pill-purple' }, { label: 'Drums', color: 'pill-fire' },
]

const FEATURES = [
  { icon: '🎥', title: 'Live WebRTC Video', desc: 'Crystal-clear peer-to-peer sessions with screen sharing & whiteboard.', color: 'neon-border-fire' },
  { icon: '⚡', title: 'Credit Economy', desc: 'Earn by teaching, spend by learning. Fair & transparent ledger.', color: 'neon-border-lime' },
  { icon: '🤝', title: 'Peer-to-Peer', desc: 'Learn directly from practitioners, not recorded lectures.', color: 'neon-border-ocean' },
  { icon: '⭐', title: 'Verified Reviews', desc: 'Only real participants can leave reviews. Zero fake ratings.', color: 'neon-border-pink' },
  { icon: '🔒', title: 'Secure & Safe', desc: 'JWT auth, encrypted channels, rate-limiting and moderation.', color: 'neon-border-purple' },
  { icon: '💬', title: 'Real-time Chat', desc: 'In-session chat, collaborative whiteboard and raise-hand.', color: 'neon-border-fire' },
]

const STATS = [
  { value: '10K+', label: 'Active learners', icon: '🧑‍🎓', color: 'text-coral-400' },
  { value: '5K+', label: 'Sessions done', icon: '✅', color: 'text-orange-300' },
  { value: '500+', label: 'Expert teachers', icon: '🎓', color: 'text-cyan-400' },
  { value: '4.9★', label: 'Avg rating', icon: '⭐', color: 'text-yellow-500' },
]

export default function Home() {
  const { isAuthenticated } = useAuthStore()
  const heroRef = useRef()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, 80])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  const { data: trending } = useQuery({
    queryKey: ['trending'], queryFn: sessionService.getTrending, staleTime: 300000,
  })
  const sessions = trending?.data?.data?.sessions?.slice(0, 4) || []

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated background orbs */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: heroY, opacity: heroOpacity }}>
          <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/5 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #FF6B00, transparent 70%)' }} />
          <motion.div animate={{ scale: [1.1, 1, 1.1], rotate: [0, -8, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #FF6B00, transparent 70%)' }} />
          <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute bottom-1/3 left-1/3 w-[350px] h-[350px] rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #FF6B00, transparent 70%)' }} />
          <motion.div animate={{ scale: [1.05, 1, 1.05] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #FFAD5C, transparent 70%)' }} />
          {/* Grid dots */}
          <div className="absolute inset-0 bg-grid-dark opacity-60" />
        </motion.div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="inline-flex">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass neon-border-fire text-sm text-white/70">
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-base">✨</motion.span>
                The future of peer learning is here
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-coral-500/20 text-coral-400 border border-coral-500/30">NEW</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeUp} custom={1} className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
              <span className="text-white">Learn.</span>
              <br />
              <span className="gradient-text">Teach.</span>
              <br />
              <span className="gradient-text-jungle">Grow.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp} custom={2}
              className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              Book <span className="text-coral-400 font-semibold">live 15–60 min sessions</span> with real experts.
              Earn <span className="text-orange-300 font-semibold">credits</span> by teaching.
              No subscriptions, just <span className="text-cyan-400 font-semibold">pure skill exchange.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {isAuthenticated ? (
                <Link to="/sessions" className="btn-primary text-lg px-10 py-4">
                  Explore Sessions <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-10 py-4">
                    Start Free — Get 10 Credits <Zap size={20} />
                  </Link>
                  <Link to="/sessions" className="btn-secondary text-lg px-8 py-4">
                    Browse Sessions
                  </Link>
                </>
              )}
            </motion.div>

            {/* Animated skill pills */}
            <motion.div variants={fadeUp} custom={4} className="pt-6 overflow-hidden">
              <p className="text-xs text-white/30 mb-3 uppercase tracking-widest">Trending skills</p>
              <div className="flex gap-2 flex-wrap justify-center max-w-2xl mx-auto">
                {SKILL_PILLS.map((s, i) => (
                  <motion.span key={s.label}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.06, type: 'spring', stiffness: 300 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className={`${s.color} cursor-default`}>
                    {s.label}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-xs flex flex-col items-center gap-1">
          <span>scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* ── STATS ─────────────────────────────────────── */}
      <section className="py-16 relative border-y border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="card text-center space-y-1 neon-border-fire hover:shadow-glow-fire transition-shadow">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="pill-fire mb-3 inline-block">How it works</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-black text-white">3 steps to start learning</motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="absolute top-12 left-1/4 right-1/4 h-px hidden md:block"
              style={{ background: 'linear-gradient(90deg, #E65C00, #FF6B00, #FF8C00)' }} />
            {[
              { step: '01', emoji: '🔍', title: 'Browse & Book', desc: 'Find sessions by skill, level, or rating. Book instantly with credits.', color: 'neon-border-fire', pill: 'pill-fire' },
              { step: '02', emoji: '🎥', title: 'Join Live Room', desc: 'Enter the WebRTC video room. Chat, whiteboard, screen share.', color: 'neon-border-lime', pill: 'pill-lime' },
              { step: '03', emoji: '⭐', title: 'Rate & Repeat', desc: 'Leave a review. Earn credits by teaching your own skills.', color: 'neon-border-ocean', pill: 'pill-ocean' },
            ].map((item, i) => (
              <motion.div key={item.step}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }} viewport={{ once: true }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`card text-center space-y-4 ${item.color} relative overflow-hidden`}>
                <div className="absolute top-3 right-3 text-white/5 font-black text-5xl">{item.step}</div>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                  className="text-5xl">{item.emoji}</motion.div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────── */}
      <section className="py-20 px-4 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255,107,0,0.05), transparent)' }} />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="pill-ocean mb-3 inline-block">Platform</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-black text-white">Everything you need</motion.h2>
            <motion.p variants={fadeUp} className="text-white/40 mt-3 max-w-xl mx-auto">
              Built for serious learners and passionate teachers
            </motion.p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`card group ${f.color} cursor-default`}>
                <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                  className="text-3xl mb-3">{f.icon}</motion.div>
                <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING SESSIONS ────────────────────────── */}
      {sessions.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="flex items-center justify-between mb-10">
              <div>
                <motion.p variants={fadeUp} className="pill-fire mb-2 inline-block">🔥 Hot right now</motion.p>
                <motion.h2 variants={fadeUp} className="text-3xl font-black text-white">Trending Sessions</motion.h2>
              </div>
              <motion.div variants={fadeUp}>
                <Link to="/sessions" className="btn-ghost text-sm">View all <ArrowRight size={14} /></Link>
              </motion.div>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sessions.map((s, i) => (
                <motion.div key={s._id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                  <SessionCard session={s} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ───────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden text-center p-16">
              {/* Animated gradient background */}
              <div className="absolute inset-0 -z-10"
                style={{ background: 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,173,92,0.1), rgba(255,107,0,0.1), rgba(255,107,0,0.15))', backgroundSize: '400% 400%', animation: 'gradientShift 6s ease infinite' }} />
              <div className="absolute inset-0 -z-10 glass" />
              {/* Floating emojis */}
              {['🚀','⚡','🎓','💡','🔥','✨'].map((e, i) => (
                <motion.div key={i} animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                  className="absolute text-2xl opacity-30"
                  style={{ top: `${15 + (i % 3) * 30}%`, left: `${8 + i * 14}%` }}>{e}</motion.div>
              ))}
              <h2 className="text-4xl font-black text-white mb-3">Ready to level up?</h2>
              <p className="text-white/50 text-lg mb-8">Join free and get <span className="text-orange-300 font-bold">10 credits</span> instantly. No card needed.</p>
              <Link to="/register" className="btn-primary text-lg px-12 py-4 inline-flex">
                Create Free Account <Sparkles size={20} />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="py-10 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>S</div>
            <span className="font-bold text-white">SkillSwap</span>
          </div>
          <p className="text-white/25 text-xs">© 2026 SkillSwap · Built for learners everywhere 🌍</p>
          <div className="flex gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white/60">Privacy</a>
            <a href="#" className="hover:text-white/60">Terms</a>
            <a href="#" className="hover:text-white/60">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
