import { Link, useLocation } from 'react-router-dom'
import { Sparkles, Layers, Grid3x3, LayoutGrid, Video, Moon, Sun } from 'lucide-react'
import { useStore } from '../store/useStore'

const LINKS = [
  { to: '/create',  label: 'Crear',    icon: Sparkles  },
  { to: '/editor',  label: 'Editor',   icon: Layers    },
  { to: '/grid',    label: 'Grid',     icon: Grid3x3   },
  { to: '/gallery', label: 'Galería',  icon: LayoutGrid},
  { to: '/reels',   label: 'Reels',    icon: Video     },
]

export default function Nav() {
  const { pathname } = useLocation()
  const { darkMode, toggleDarkMode } = useStore()

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 24px', height: 54,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em',
          color: 'var(--text)', marginRight: 16, textDecoration: 'none',
        }}>
          <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="4" fill="var(--accent)"/>
            <circle cx="20" cy="20" r="9"    fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.6"/>
            <circle cx="20" cy="20" r="15"   fill="none" stroke="var(--accent)" strokeWidth="1"   opacity="0.3"/>
            <circle cx="20" cy="20" r="19.5" fill="none" stroke="var(--accent)" strokeWidth="0.6" opacity="0.15"/>
          </svg>
          AURE
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          {LINKS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8,
                  fontSize: 13, fontWeight: 500,
                  color: active ? 'var(--text)' : 'var(--text-3)',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.15s',
                }}>
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Theme toggle */}
        <button onClick={toggleDarkMode} className="btn-icon btn"
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}
