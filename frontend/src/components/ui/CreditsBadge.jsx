import { Zap } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { useCredits } from '../../hooks/useCredits'

export default function CreditsBadge({ className }) {
  const { balance } = useCredits()

  return (
    <div className={cn(
      'flex items-center gap-1.5 rounded-full px-3 py-1.5',
      className
    )}
      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}>
      <Zap size={13} className="text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-bold text-white">{balance}</span>
      <span className="text-xs text-white/45">credits</span>
    </div>
  )
}
