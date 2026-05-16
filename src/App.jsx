import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store/useStore'
import Nav from './components/Nav'
import Landing  from './pages/Landing'
import Create   from './pages/Create'
import Editor   from './pages/Editor'
import Grid     from './pages/Grid'
import Gallery  from './pages/Gallery'
import Reels    from './pages/Reels'

const NO_NAV = ['/']

export default function App() {
  const { darkMode } = useStore()
  const location = useLocation()
  const showNav = !NO_NAV.includes(location.pathname)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showNav && <Nav />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"        element={<Landing />} />
          <Route path="/create"  element={<Create />} />
          <Route path="/editor"  element={<Editor />} />
          <Route path="/grid"    element={<Grid />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/reels"   element={<Reels />} />
        </Routes>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  )
}
