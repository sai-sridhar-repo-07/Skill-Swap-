import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, Users, Zap, Star } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { formatDateTime, truncate } from '../../utils/helpers'

const LEVEL_PILLS = {
  Beginner:     'pill-lime',
  Intermediate: 'pill-ocean',
  Advanced:     'pill-fire',
}

const STATUS_STYLES = {
  upcoming:  { pill: 'pill-ocean', dot: 'bg-white/40' },
  live:      { pill: 'pill-fire',  dot: 'bg-orange-400 animate-ping' },
  completed: { pill: 'pill-purple', dot: 'bg-white/20' },
  cancelled: { pill: 'pill-yellow', dot: 'bg-white/30' },
  draft:     { pill: 'pill-ocean',  dot: 'bg-white/25' },
}

// Indian flag — saffron + navy deterministic tag styles
const TAG_STYLES = [
  { bg: 'rgba(255,107,0,0.14)', border: 'rgba(255,107,0,0.3)',  color: '#FF6B00' },  // saffron
  { bg: 'rgba(57,73,171,0.12)',  border: 'rgba(57,73,171,0.28)',  color: '#9fa8da' },  // navy
  { bg: 'rgba(255,173,92,0.1)',  border: 'rgba(255,173,92,0.25)', color: '#FFAD5C' },  // light saffron
  { bg: 'rgba(92,107,192,0.1)',  border: 'rgba(92,107,192,0.22)', color: '#b0bdf7' },  // light navy
  { bg: 'rgba(255,119,0,0.1)',   border: 'rgba(255,119,0,0.22)',  color: '#FF6B00' },  // deep saffron
  { bg: 'rgba(26,35,126,0.12)',  border: 'rgba(26,35,126,0.25)',  color: '#7986cb' },  // dark navy
]
const tagStyle = (str) => TAG_STYLES[(str?.charCodeAt(0) || 0) % TAG_STYLES.length]

export default function SessionCard({ session }) {
  const { _id, title, description, skillTag, level, duration, creditCost,
    maxSeats, bookedUsers = [], status, startTime, hostId } = session

  const seatsLeft  = maxSeats - bookedUsers.length
  const statusS    = STATUS_STYLES[status] || STATUS_STYLES.upcoming
  const levelPill  = LEVEL_PILLS[level] || 'pill-ocean'
  const ts         = tagStyle(skillTag)

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
      className="card flex flex-col gap-3 h-full cursor-pointer group"
      style={{ border: '1px solid rgba(255,107,0,0.1)' }}>

      {/* Top row: status + cost */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`flex items-center gap-1 ${statusS.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusS.dot}`} />
            {status}
          </span>
          <span className={levelPill}>{level}</span>
        </div>
        <motion.div whileHover={{ scale: 1.1 }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-white"
          style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)' }}>
          <Zap size={11} className="fill-orange-400 text-orange-400" />{creditCost}
        </motion.div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-orange-300 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs text-white/40 line-clamp-2 flex-1 leading-relaxed">{truncate(description, 110)}</p>

      {/* Tag */}
      <span className="inline-flex items-center self-start px-2 py-0.5 rounded-md text-[11px] font-semibold border"
        style={{ background: ts.bg, borderColor: ts.border, color: ts.color }}>
        #{skillTag}
      </span>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-white/35">
        <span className="flex items-center gap-1"><Clock size={11} />{duration}m</span>
        <span className="flex items-center gap-1">
          <Users size={11} />
          <span className={seatsLeft === 0 ? 'text-white/60 font-semibold' : seatsLeft <= 2 ? 'text-orange-300 font-semibold' : ''}>
            {seatsLeft}/{maxSeats}
          </span>
        </span>
        <span className="ml-auto text-[10px]">{formatDateTime(startTime)}</span>
      </div>

      {/* Host + CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-white/6 mt-auto">
        {hostId ? (
          <div className="flex items-center gap-2">
            <Avatar src={hostId.avatar} name={hostId.name} size="xs" />
            <div>
              <p className="text-xs font-medium text-white/60">{hostId.name}</p>
              {hostId.rating > 0 && (
                <div className="flex items-center gap-0.5">
                  <Star size={9} className="fill-orange-400 text-orange-400" />
                  <span className="text-[10px] text-white/35">{Number(hostId.rating).toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        ) : <span />}
        <Link to={`/sessions/${_id}`}
          className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-500/10 flex items-center gap-1">
          View <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
        </Link>
      </div>
    </motion.div>
  )
}
