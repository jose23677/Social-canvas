import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Layers, Grid3x3, LayoutGrid, Video,
  Settings, Moon, Sun, LogOut, User, ChevronRight,
  Wand2,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { signOut } from '../../lib/supabase'

const NAV = [
  { path: '/studio', icon: Sparkles, label: 'Creative Studio', badge: 'IA' },
  { path: '/editor', icon: Layers,   label: 'Editor' },
  { path: '/grid',   icon: Grid3x3,  label: 'Grid Maker' },
  { path: '/gallery',icon: LayoutGrid,label: 'Galería' },
  { path: '/reels',  icon: Video,    label: 'AI Reels' },
]

export default function AppLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { darkMode, toggleDarkMode, user, setUser } = useStore()
  const [expanded, setExpanded] = useState(false)

  const handleLogout = async () => {
    await signOut(); setUser(null); navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: expanded ? 220 : 60 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 10px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          background: 'var(--bg-1)',
          overflow: 'hidden',
          zIndex: 40,
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}>

        {/* Logo */}
        <Link to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 24, textDecoration: 'none', borderRadius: 10, overflow: 'hidden', flexShrink: 0, minWidth: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
            <Sparkles size={15} color="white" strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                Social<span style={{ color: '#818cf8' }}>Canvas</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV.map(({ path, icon: Icon, label, badge }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: active ? 'var(--text)' : 'var(--text-3)',
                  background: active ? 'var(--surface-h)' : 'transparent',
                  border: active ? '1px solid var(--border)' : '1px solid transparent',
                  transition: 'all 0.15s',
                  overflow: 'hidden', flexShrink: 0, minWidth: 0,
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'var(--surface)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' } }}>
                <Icon size={17} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
                      {badge && (
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', padding: '2px 6px', background: 'var(--indigo-deep)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 99, color: '#818cf8', flexShrink: 0 }}>
                          {badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2, background: '#6366f1', borderRadius: 2 }} />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 12, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {[
            { icon: darkMode ? Sun : Moon, action: toggleDarkMode, label: darkMode ? 'Modo claro' : 'Modo oscuro' },
            { icon: Settings, action: () => navigate('/settings'), label: 'Configuración', path: '/settings' },
            ...(user ? [{ icon: LogOut, action: handleLogout, label: 'Salir' }] : [{ icon: User, action: () => navigate('/auth'), label: 'Iniciar sesión' }]),
          ].map((item, i) => (
            <button key={i} onClick={item.action}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 10,
                border: 'none', background: 'transparent',
                color: 'var(--text-3)', cursor: 'pointer',
                transition: 'all 0.15s', overflow: 'hidden', width: '100%', textAlign: 'left', flexShrink: 0,
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'var(--surface)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}>
              <item.icon size={16} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {expanded && (
                  <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                    style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}

          {/* User avatar */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginTop: 4, overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {(user.user_metadata?.name || user.email || 'U')[0].toUpperCase()}
              </div>
              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.user_metadata?.name || user.email?.split('@')[0]}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto', background: 'var(--bg)' }}>
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
          {children}
        </motion.div>
      </main>
    </div>
  )
}
