import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, LogOut, User, Settings, LayoutDashboard, Plus, Sun, Moon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import Avatar from '../ui/Avatar'
import NotificationBell from '../common/NotificationBell'
import { formatCredits } from '../../utils/helpers'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { toggleSidebar, toggleTheme, theme } = useUIStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef()

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <motion.header
      initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={scrolled ? { background: 'color-mix(in srgb, var(--bg-primary) 92%, transparent)', borderBottom: '1px solid var(--border-subtle)' } : {}}
      className={`fixed top-0 left-0 right-0 z-40 h-16 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleSidebar}
              className="p-2 rounded-xl hover:bg-white/8 text-white/60 hover:text-white transition-colors lg:hidden">
              <Menu size={20} />
            </motion.button>
          )}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-glow-fire"
              style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>S</motion.div>
            <span className="font-black text-lg hidden sm:block tracking-tight" style={{ color: 'var(--text-primary)' }}>Skill<span className="gradient-text">Swap</span></span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/sessions" className="px-4 py-2 rounded-xl hover:bg-white/6 text-sm font-medium transition-all"
            style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            Browse
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="px-4 py-2 rounded-xl hover:bg-white/6 text-sm font-medium transition-all"
              style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl transition-all duration-200"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.span key="sun" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.18 }}>
                  <Sun size={16} />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.18 }}>
                  <Moon size={16} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          {isAuthenticated ? (
            <>
              {/* Credits badge */}
              <motion.div whileHover={{ scale: 1.05 }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-yellow-500/20 text-sm cursor-default"
                style={{ background: 'var(--bg-card)' }}>
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>⚡</motion.span>
                <span className="font-bold text-yellow-400">{formatCredits(user?.creditsBalance)}</span>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>credits</span>
              </motion.div>

              <Link to="/sessions/create" className="hidden sm:flex items-center gap-1.5 btn-primary py-2 px-4 text-sm">
                <Plus size={15} /> Create
              </Link>

              <NotificationBell />

              {/* User menu */}
              <div className="relative" ref={menuRef}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/8 transition-colors">
                  <Avatar src={user?.avatar} name={user?.name} size="sm" />
                </motion.button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl shadow-card overflow-hidden z-50"
                      style={{ border: '1px solid var(--border-subtle)' }}>
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>{user?.email}</p>
                      </div>
                      {[
                        { icon: <LayoutDashboard size={15}/>, label: 'Dashboard', to: '/dashboard' },
                        { icon: <User size={15}/>, label: 'Edit Profile', to: '/profile/edit' },
                        ...(user?.role === 'admin' ? [{ icon: <Settings size={15}/>, label: 'Admin Panel', to: '/admin' }] : []),
                      ].map((item) => (
                        <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/6"
                          style={{ color: 'var(--text-muted)' }}>
                          <span className="text-coral-400">{item.icon}</span>{item.label}
                        </Link>
                      ))}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-coral-400 hover:bg-coral-500/10 transition-colors"
                        style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <LogOut size={15} /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Log in</Link>
              <motion.div whileHover={{ scale: 1.03 }}>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Sign up free</Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
