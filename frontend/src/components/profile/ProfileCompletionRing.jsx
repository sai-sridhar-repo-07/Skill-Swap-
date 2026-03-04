import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Ring cycles through Indian Tricolour:
// 0-39% → saffron, 40-79% → white→saffron blend, 80-99% → india green, 100% → full green
const ringColor = (pct) => {
  if (pct >= 80)  return '#138808'   // India green
  if (pct >= 40)  return '#FF9933'   // India saffron
  return '#E67E00'                    // deep saffron (incomplete)
}

export default function ProfileCompletionRing({ pct = 0, size = 96, className = '' }) {
  const motionPct = useMotionValue(0)
  const strokeDashoffset = useTransform(motionPct, (v) => CIRCUMFERENCE * (1 - v / 100))

  useEffect(() => {
    const ctrl = animate(motionPct, pct, { duration: 1.2, ease: 'easeOut' })
    return () => ctrl.stop()
  }, [pct])

  const viewBox = 100
  const strokeW = 8
  const color = ringColor(pct)

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${viewBox} ${viewBox}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          {/* Tricolour gradient painted along the ring arc */}
          <linearGradient id="tricolourRing" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#FF9933" />
            <stop offset="50%"  stopColor="#FFFFFF" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#138808" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeW}
        />
        {/* Progress arc — tricolour when complete, single colour when partial */}
        <motion.circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke={pct >= 80 ? 'url(#tricolourRing)' : color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black" style={{ color }}>{Math.round(pct)}%</span>
        <span className="text-[9px] text-white/40 leading-tight">Profile</span>
      </div>
    </div>
  )
}
