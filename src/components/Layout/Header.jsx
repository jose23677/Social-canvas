import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Globe, LogOut, User, Layers, Image, Settings, Key, LayoutGrid, Sparkles, Grid } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { signOut } from '../../lib/supabase'
import { cn } from '../UI'
import toast from 'react-hot-toast'
import i18n from '../../i18n'

export default function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const { darkMode, toggleDarkMode, user, setUser, language, setLanguage } = useStore()

  const navItems = [
    { path: '/studio', label: 'Creative Studio', icon: Sparkles, highlight: true },
    { path: '/grid', label: 'Grid Maker', icon: Grid },
    { path: '/', label: t('nav.editor'), icon: Layers },
    { path: '/gallery', label: t('nav.gallery'), icon: LayoutGrid },
    { path: '/ai-video', label: 'Reels IA', icon: Image },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
    { path: '/apikeys', label: t('nav.apikeys'), icon: Key },
  ]

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    toast.success(t('auth.success'))
  }

  const toggleLang = () => {
    const next = language === 'es' ? 'en' : 'es'
    setLanguage(next)
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
      <div className="flex items-center gap-2 px-4 h-14 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-4 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm hidden sm:block">
            Social<span className="text-indigo-500">Canvas</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
          {navItems.map(({ path, label, icon: Icon, highlight }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                location.pathname === path
                  ? highlight
                    ? 'bg-[#C4A882]/20 text-[#8C6B4A] dark:text-[#C4A882]'
                    : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : highlight
                    ? 'text-[#C4A882] hover:bg-[#C4A882]/10 border border-[#C4A882]/30'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:block">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleLang}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Switch language"
          >
            <Globe className="w-4 h-4" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {(user.user_metadata?.name || user.email || 'U')[0].toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={t('nav.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors ml-1"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:block">{t('nav.login')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
