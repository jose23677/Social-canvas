import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Layers, Grid3x3, LayoutGrid, Video, Settings, Moon, Sun, LogOut, User } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { signOut } from '../../lib/supabase'

const NAV = [
  { path: '/studio', icon: Sparkles,   label: 'Creative Studio', badge: 'IA' },
  { path: '/editor', icon: Layers,     label: 'Editor' },
  { path: '/grid',   icon: Grid3x3,    label: 'Grid Maker' },
  { path: '/gallery',icon: LayoutGrid, label: 'Galería' },
  { path: '/reels',  icon: Video,      label: 'AI Reels' },
]

function AuraMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="3.5" fill="#C8A97A"/>
      <circle cx="20" cy="20" r="8"    fill="none" stroke="#C8A97A" strokeWidth="1.2" opacity="0.65"/>
      <circle cx="20" cy="20" r="13.5" fill="none" stroke="#C8A97A" strokeWidth="0.8" opacity="0.35"/>
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="#C8A97A" strokeWidth="0.5" opacity="0.16"/>
    </svg>
  )
}

export default function AppLayout({ children }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { darkMode, toggleDarkMode, user, setUser } = useStore()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => { await signOut(); setUser(null); navigate('/') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: open ? 216 : 58 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-1)',
          display: 'flex', flexDirection: 'column',
          padding: '14px 10px', overflow: 'hidden', zIndex: 40,
        }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', marginBottom: 20, textDecoration: 'none', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30 }}>
            <AuraMark size={28} />
          </div>
          <AnimatePresence>
            {open && (
              <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.14 }}
                style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                aura
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ path, icon: Icon, label, badge }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path} className={`nav-link${active ? ' active' : ''}`}
                style={{ position: 'relative', overflow: 'hidden', padding: '9px 9px' }}>
                {active && <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 2, background: 'var(--accent)', borderRadius: 2 }} />}
                <Icon size={16} style={{ flexShrink: 0, marginLeft: active ? 4 : 2 }} />
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.13 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
                      {badge && (
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', padding: '2px 6px', background: 'var(--accent-deep)', border: '1px solid var(--accent-border)', borderRadius: 99, color: 'var(--accent)', flexShrink: 0 }}>
                          {badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 10, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {[
            { icon: darkMode ? Sun : Moon, action: toggleDarkMode, label: darkMode ? 'Modo claro' : 'Modo oscuro' },
            { icon: Settings, action: () => navigate('/settings'), label: 'Configuración' },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className="nav-link"
              style={{ border: 'none', width: '100%', cursor: 'pointer', padding: '9px 9px', overflow: 'hidden' }}>
              <item.icon size={16} style={{ flexShrink: 0, marginLeft: 2 }} />
              <AnimatePresence>
                {open && (
                  <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.13 }}
                    style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}

          {user ? (
            <>
              <button onClick={handleLogout} className="nav-link" style={{ border: 'none', width: '100%', cursor: 'pointer', padding: '9px 9px', overflow: 'hidden' }}>
                <LogOut size={16} style={{ flexShrink: 0, marginLeft: 2 }} />
                <AnimatePresence>
                  {open && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.13 }}
                      style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
                      Salir
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 9px', marginTop: 4, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-deep)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>
                  {(user.user_metadata?.name || user.email || 'U')[0].toUpperCase()}
                </div>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.13 }} style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.user_metadata?.name || user.email?.split('@')[0]}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/auth" className="nav-link" style={{ padding: '9px 9px', overflow: 'hidden' }}>
              <User size={16} style={{ flexShrink: 0, marginLeft: 2 }} />
              <AnimatePresence>
                {open && <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.13 }} style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>Iniciar sesión</motion.span>}
              </AnimatePresence>
            </Link>
          )}
        </div>
      </motion.aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto', background: 'var(--bg)' }}>
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}>
          {children}
        </motion.div>
      </main>
    </div>
  )
}
