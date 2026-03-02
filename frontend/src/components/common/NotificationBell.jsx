import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check } from 'lucide-react'
import { useNotificationStore } from '../../store/notificationStore'
import { notificationService } from '../../services/sessionService'
import { timeAgo } from '../../utils/helpers'

const TYPE_ICONS = {
  booking_confirmed:'✅', session_reminder:'⏰', credit_received:'⚡',
  review_received:'⭐', session_cancelled:'❌', session_completed:'🎉',
  badge_earned:'🏆', admin_alert:'⚠️',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead, markAllRead, setNotifications } = useNotificationStore()
  const ref = useRef()

  useEffect(() => {
    notificationService.getAll().then(({ data }) =>
      setNotifications(data.data.notifications, data.data.unreadCount)
    ).catch(() => {})
  }, [])

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-white/8 text-white/50 hover:text-white transition-colors">
        <Bell size={19} />
        {unreadCount > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{ background: 'rgba(16,16,24,0.97)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            {/* Top accent */}
            <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, #E65C00, #FF6B00, #FF8C00)' }} />
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Bell size={14} className="text-coral-400" /> Notifications
              </h3>
              {unreadCount > 0 && (
                <button onClick={() => { markAllRead(); notificationService.markAllRead().catch(() => {}); setOpen(false) }}
                  className="text-[11px] font-semibold text-orange-300 hover:text-orange-200 flex items-center gap-1">
                  <Check size={11} /> All read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-white/25 text-sm">
                  <div className="text-3xl mb-2">🔔</div>No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div key={n._id || n.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={`flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/4 transition-colors ${!n.isRead ? 'bg-coral-500/4' : ''}`}>
                    <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${!n.isRead ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                      <p className="text-xs text-white/35 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-white/25 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }} />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
