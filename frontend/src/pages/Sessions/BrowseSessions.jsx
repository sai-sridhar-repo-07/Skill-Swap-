import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X, Zap, TrendingUp, Sparkles } from 'lucide-react'
import { sessionService } from '../../services/sessionService'
import SessionCard from '../../components/session/SessionCard'
import { SessionCardSkeleton } from '../../components/ui/Skeleton'
import Navbar from '../../components/layout/Navbar'
import { SKILL_CATEGORIES } from '../../utils/helpers'

const LEVELS    = ['Beginner', 'Intermediate', 'Advanced']
const DURATIONS = [15, 30, 45, 60]

const STATUS_TABS = [
  { key: 'upcoming',  label: 'Upcoming', dot: 'bg-cyan-400' },
  { key: 'live',      label: 'Live Now', dot: 'bg-lime-400 animate-ping' },
  { key: 'completed', label: 'Completed', dot: 'bg-white/30' },
]

export default function BrowseSessions() {
  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDS]    = useState('')
  const [filters, setFilters]       = useState({ skill: '', level: '', maxCost: '', duration: '', status: 'upcoming' })
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage]             = useState(1)
  const debounceTimer               = useRef()

  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setDS(val), 400)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', filters, debouncedSearch, page],
    queryFn: () => sessionService.getAll({ ...filters, search: debouncedSearch, page, limit: 12 }),
  })
  const { data: trending } = useQuery({
    queryKey: ['trending'], queryFn: sessionService.getTrending, staleTime: 300000,
  })

  const sessions        = data?.data?.data?.sessions || []
  const total           = data?.data?.data?.total || 0
  const pages           = data?.data?.data?.pages || 1
  const trendingSessions = trending?.data?.data?.sessions || []

  const clearFilter = (key) => setFilters((f) => ({ ...f, [key]: '' }))
  const activeFilters = Object.entries(filters).filter(([k, v]) => v && k !== 'status')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="pt-16">
        {/* Hero search */}
        <div className="relative py-14 px-4 overflow-hidden border-b border-white/5"
          style={{ background: 'linear-gradient(180deg, rgba(255,153,51,0.04) 0%, rgba(255,153,51,0.02) 100%)' }}>
          <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
          <div className="max-w-2xl mx-auto text-center relative space-y-4">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 pill-fire mb-2">
              <Sparkles size={12} /> Browse {total || '…'} sessions
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black text-white">Find Your Next <span className="gradient-text">Session</span></motion.h1>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                className="input pl-11 pr-4 text-base w-full !py-4"
                placeholder="Search by skill, topic, or keyword…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ border: '1.5px solid rgba(255,153,51,0.25)', boxShadow: '0 0 20px rgba(255,153,51,0.1)' }}
              />
              {search && (
                <button onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Trending pills */}
          {trendingSessions.length > 0 && !debouncedSearch && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3 flex items-center gap-2">
                <TrendingUp size={12} className="text-coral-400" /> Trending
              </h2>
              <div className="flex gap-2 flex-wrap">
                {trendingSessions.slice(0, 8).map((s, i) => (
                  <motion.button key={s._id}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    onClick={() => setFilters((f) => ({ ...f, skill: s.skillTag }))}
                    className="pill-fire cursor-pointer flex items-center gap-1">
                    <Zap size={10} className="fill-current" />{s.skillTag}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Status tabs + filter bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {/* Status tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {STATUS_TABS.map((tab) => (
                <button key={tab.key}
                  onClick={() => setFilters((f) => ({ ...f, status: tab.key }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    filters.status === tab.key
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-white/40 hover:text-white'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />{tab.label}
                </button>
              ))}
            </div>

            {/* Filter toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                showFilters ? 'border-coral-500/40 text-coral-400' : 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
              style={{ background: showFilters ? 'rgba(255,153,51,0.08)' : 'rgba(255,255,255,0.04)' }}>
              <SlidersHorizontal size={14} /> Filters
              {activeFilters.length > 0 && (
                <span className="w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Active chips */}
            {activeFilters.map(([key, val]) => (
              <motion.span key={key} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="flex items-center gap-1 pill-fire">
                {val}
                <button onClick={() => clearFilter(key)} className="hover:opacity-70 ml-0.5"><X size={10} /></button>
              </motion.span>
            ))}

            <span className="ml-auto text-xs text-white/25 font-medium">{total} sessions</span>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                <div className="card grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  style={{ border: '1px solid rgba(255,153,51,0.2)', background: 'rgba(255,153,51,0.04)' }}>
                  {[
                    { label: 'Skill Category', key: 'skill', options: SKILL_CATEGORIES, placeholder: 'All skills' },
                    { label: 'Level', key: 'level', options: LEVELS, placeholder: 'All levels' },
                  ].map(({ label, key, options, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-white/40 mb-1.5 block uppercase tracking-wider">{label}</label>
                      <select className="input text-sm py-2.5"
                        value={filters[key]} onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}>
                        <option value="">{placeholder}</option>
                        {options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold text-white/40 mb-1.5 block uppercase tracking-wider">Max Cost</label>
                    <input type="number" min={1} max={50} className="input text-sm py-2.5" placeholder="e.g. 10 credits"
                      value={filters.maxCost} onChange={(e) => setFilters((f) => ({ ...f, maxCost: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 mb-1.5 block uppercase tracking-wider">Max Duration</label>
                    <select className="input text-sm py-2.5"
                      value={filters.duration} onChange={(e) => setFilters((f) => ({ ...f, duration: e.target.value }))}>
                      <option value="">Any duration</option>
                      {DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SessionCardSkeleton key={i} />)}
            </div>
          ) : sessions.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-24">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
                className="text-6xl mb-4">🔍</motion.div>
              <h3 className="text-xl font-bold text-white mb-2">No sessions found</h3>
              <p className="text-white/35 text-sm">Try adjusting your filters</p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sessions.map((s, i) => (
                <motion.div key={s._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}>
                  <SessionCard session={s} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary px-5 py-2 text-sm disabled:opacity-30">← Prev</button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      p === page ? 'text-white shadow-glow-fire' : 'text-white/40 hover:text-white hover:bg-white/8'
                    }`}
                    style={p === page ? { background: 'linear-gradient(135deg, #CC5200, #FF8C00)' } : {}}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                className="btn-secondary px-5 py-2 text-sm disabled:opacity-30">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
