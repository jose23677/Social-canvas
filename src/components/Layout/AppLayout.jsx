import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Layers, Grid3x3, Image, LayoutGrid, Video, Settings, Moon, Sun, LogOut, User, ChevronRight } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { signOut } from '../../lib/supabase'

const NAV = [
  { path: '/studio', icon: Sparkles,    label: 'Creative Studio', badge: 'IA' },
  { path: '/editor', icon: Layers,      label: 'Editor' },
  { path: '/grid',   icon: Grid3x3,     label: 'Grid Maker' },
  { path: '/gallery',icon: LayoutGrid,  label: 'Galería' },
  { path: '/reels',  icon: Video,       label: 'AI Reels' },
]

export default function AppLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { darkMode, toggleDarkMode, user, setUser } = useStore()

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: 'var(--bg)',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 24, textDecoration: 'none', borderRadius: 10, transition: 'background 0.15s' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
            Social<span style={{ color: 'var(--accent)' }}>Canvas</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ path, icon: Icon, label, badge }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path} className={`nav-item ${active ? 'active' : ''}`}>
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge && (
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', padding: '2px 6px', background: 'var(--accent-glow)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 99, color: 'var(--accent-h)' }}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <button onClick={toggleDarkMode} className="nav-item" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
          <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={17} />
            <span>Configuración</span>
          </Link>
          {user ? (
            <button onClick={handleLogout} className="nav-item" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--text-3)' }}>
              <LogOut size={17} />
              <span>Salir</span>
            </button>
          ) : (
            <Link to="/auth" className="nav-item">
              <User size={17} />
              <span>Iniciar sesión</span>
            </Link>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
