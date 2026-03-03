import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Search, Plus, Star, X, Shield, Zap } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import Avatar from '../ui/Avatar'
import { formatCredits } from '../../utils/helpers'

const navItems = [
  { icon: <LayoutDashboard size={17}/>, label: 'Dashboard', to: '/dashboard', color: 'coral' },
  { icon: <Search size={17}/>, label: 'Browse Sessions', to: '/sessions', color: 'ocean' },
  { icon: <Plus size={17}/>, label: 'Create Session', to: '/sessions/create', color: 'lime' },
  { icon: <Star size={17}/>, label: 'Edit Profile', to: '/profile/edit', color: 'pink' },
]

// All nav items use saffron or navy accents (Indian flag theme)
const colorMap = {
  coral:  { active: 'bg-orange-500/15 text-orange-400 border-orange-500/25',  icon: 'text-orange-400' },
  ocean:  { active: 'bg-orange-400/10 text-orange-300 border-orange-400/20',  icon: 'text-orange-300' },
  lime:   { active: 'bg-orange-500/12 text-orange-400 border-orange-500/22',  icon: 'text-orange-400' },
  pink:   { active: 'bg-white/10 text-white border-white/20',              icon: 'text-white/80'  },
  amber:  { active: 'bg-white/8 text-white/90 border-white/15',            icon: 'text-white/70'  },
}

export default function Sidebar() {
  const { user } = useAuthStore()
  const { sidebarOpen, closeSidebar } = useUIStore()

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden" onClick={closeSidebar} />
        )}
      </AnimatePresence>

      <aside className={`fixed top-16 left-0 bottom-0 w-64 z-30 flex flex-col transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'color-mix(in srgb, var(--bg-primary) 96%, transparent)', backdropFilter: 'blur(20px)', borderRight: '1px solid var(--border-subtle)', transition: 'background 0.3s ease' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {/* User card */}
          <motion.div whileHover={{ scale: 1.01 }}
            className="rounded-2xl p-3 mb-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(255,153,51,0.1), rgba(255,179,71,0.05))', border: '1px solid rgba(255,153,51,0.2)' }}>
            <Avatar src={user?.avatar} name={user?.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>⚡</motion.span>
                <span className="text-xs font-bold text-orange-400">{formatCredits(user?.creditsBalance)}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>credits</span>
              </div>
            </div>
            <button onClick={closeSidebar} className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-white/30">
              <X size={13} />
            </button>
          </motion.div>

          {/* Nav items */}
          {navItems.map((item, i) => {
            const c = colorMap[item.color]
            return (
              <NavLink key={item.to} to={item.to} onClick={closeSidebar}
                style={{ color: 'var(--text-muted)' }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    isActive ? `${c.active} border` : 'hover:bg-white/5 border-transparent'
                  }`
                }>
                {({ isActive }) => (
                  <>
                    <span className={isActive ? c.icon : 'text-white/30'}>{item.icon}</span>
                    {item.label}
                    {isActive && (
                      <motion.div layoutId="sidebar-active"
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: 'currentColor' }} />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}

          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border mt-2 ${
                  isActive ? `${colorMap.amber.active} border` : 'text-yellow-400/50 hover:text-yellow-400 hover:bg-yellow-500/8 border-yellow-500/20'
                }`
              }>
              <Shield size={17} className="text-yellow-400" /> Admin Panel
            </NavLink>
          )}
        </div>

        {/* Bottom hint */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="rounded-xl p-3 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(255,153,51,0.08), rgba(255,153,51,0.05))', border: '1px solid rgba(255,153,51,0.15)' }}>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Teach a skill, earn credits</p>
            <NavLink to="/sessions/create" onClick={closeSidebar}
              className="text-xs font-bold text-orange-300 hover:text-orange-200 transition-colors">
              + Create Session →
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  )
}
