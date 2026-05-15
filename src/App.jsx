import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store/useStore'
import { getSession, getSupabase } from './lib/supabase'
import Header from './components/Layout/Header'
import CanvasEditor from './components/Editor/CanvasEditor'
import AuthPage from './components/Auth/AuthPage'
import SettingsPage from './pages/SettingsPage'
import ApiKeysPage from './pages/ApiKeysPage'
import GalleryPage from './pages/GalleryPage'
import AIVideoPage from './pages/AIVideoPage'
import './i18n'

export default function App() {
  const { darkMode, setUser } = useStore()

  // Sync dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Restore auth session
  useEffect(() => {
    getSession().then((session) => {
      if (session?.user) setUser(session.user)
    })

    const sb = getSupabase()
    if (!sb) return
    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => listener?.subscription?.unsubscribe()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<CanvasEditor />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/ai-video" element={<AIVideoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/apikeys" element={<ApiKeysPage />} />
        </Routes>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white',
          style: { borderRadius: '12px', fontSize: '14px' },
        }}
      />
    </div>
  )
}
