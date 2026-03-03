import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const ringColor = (pct) => {
  if (pct >= 100) return '#22c55e'
  if (pct >= 40)  return '#FF6B00'
  return '#ef4444'
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
        {/* Track */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeW}
        />
        {/* Progress arc */}
        <motion.circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke={color}
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
