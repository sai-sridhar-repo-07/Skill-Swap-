import { Search, SlidersHorizontal, X } from 'lucide-react'
import { SKILL_CATEGORIES } from '../../utils/helpers'
import { cn } from '../../utils/helpers'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const LEVEL_ACTIVE = { Beginner: 'pill-lime', Intermediate: 'pill-yellow', Advanced: 'pill-fire' }
const SORT_OPTIONS = [
  { value: 'scheduledAt',    label: 'Upcoming' },
  { value: '-enrolledCount', label: 'Most Popular' },
  { value: 'creditCost',     label: 'Lowest Cost' },
  { value: '-creditCost',    label: 'Highest Cost' },
]

export default function SessionFilters({ filters, onChange, onReset }) {
  const hasFilters = filters.search || filters.category || filters.level || filters.sort !== 'scheduledAt'

  return (
    <div className="card space-y-4" style={{ border: '1px solid rgba(255,153,51,0.15)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider">
          <SlidersHorizontal size={13} className="text-coral-400" style={{ color: '#FF9933' }} />
          Filters
        </div>
        {hasFilters && (
          <button onClick={onReset}
            className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" placeholder="Search sessions…"
          value={filters.search || ''} onChange={(e) => onChange({ search: e.target.value })}
          className="input pl-9 text-sm" />
      </div>

      {/* Category */}
      <div>
        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {SKILL_CATEGORIES.map((cat) => (
            <button key={cat}
              onClick={() => onChange({ category: filters.category === cat ? '' : cat })}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-all',
                filters.category === cat
                  ? 'text-white border-coral-500/40'
                  : 'text-white/40 border-white/10 hover:text-white hover:border-white/20'
              )}
              style={filters.category === cat ? { background: 'rgba(255,153,51,0.15)', borderColor: 'rgba(255,153,51,0.35)' } : { background: 'var(--bg-card)' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">Level</label>
        <div className="flex gap-2">
          {LEVELS.map((level) => (
            <button key={level}
              onClick={() => onChange({ level: filters.level === level ? '' : level })}
              className={cn(
                'flex-1 text-xs py-1.5 rounded-lg border transition-all font-medium',
                filters.level === level
                  ? `${LEVEL_ACTIVE[level]} !rounded-lg`
                  : 'text-white/40 border-white/10 hover:text-white hover:border-white/20'
              )}
              style={filters.level !== level ? { background: 'var(--bg-card)' } : {}}>
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">Sort By</label>
        <select value={filters.sort || 'scheduledAt'}
          onChange={(e) => onChange({ sort: e.target.value })} className="input text-sm">
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
