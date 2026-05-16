import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store/useStore'
import { getSession, getSupabase } from './lib/supabase'

// Layout
import AppLayout from './components/Layout/AppLayout'

// Pages
import LandingPage        from './pages/LandingPage'
import ContentStudioPage  from './pages/ContentStudioPage'
import GridSplitterPage   from './pages/GridSplitterPage'
import GalleryPage        from './pages/GalleryPage'
import AIVideoPage        from './pages/AIVideoPage'
import SettingsPage       from './pages/SettingsPage'
import AuthPage           from './components/Auth/AuthPage'

// Canvas editor (for /editor route)
import CanvasEditor from './components/Editor/CanvasEditor'

import './i18n'

// Pages that use the sidebar layout
const APP_ROUTES = ['/studio', '/editor', '/grid', '/gallery', '/reels', '/settings']

export default function App() {
  const { darkMode, setUser } = useStore()
  const location = useLocation()

  const isApp = APP_ROUTES.some(r => location.pathname.startsWith(r))

  // Sync dark mode / light mode class
  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  // Restore auth session
  useEffect(() => {
    getSession().then(session => { if (session?.user) setUser(session.user) })
    const sb = getSupabase()
    if (!sb) return
    const { data: l } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user || null))
    return () => l?.subscription?.unsubscribe()
  }, [])

  const routes = (
    <Routes>
      <Route path="/"        element={<LandingPage />} />
      <Route path="/auth"    element={<AuthPage />} />
      <Route path="/studio"  element={<ContentStudioPage />} />
      <Route path="/editor"  element={<CanvasEditor />} />
      <Route path="/grid"    element={<GridSplitterPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/reels"   element={<AIVideoPage />} />
      <Route path="/settings"element={<SettingsPage />} />
    </Routes>
  )

  return (
    <>
      {isApp ? <AppLayout>{routes}</AppLayout> : routes}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </>
  )
}
