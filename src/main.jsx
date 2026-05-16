import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n'
import App from './App.jsx'

// Apply dark mode class immediately (avoids flash)
const saved = JSON.parse(localStorage.getItem('aure-store') || '{}')
const dark = saved?.state?.darkMode ?? true
document.documentElement.classList.toggle('dark', dark)
document.documentElement.classList.toggle('light', !dark)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/Social-canvas">
      <App />
    </BrowserRouter>
  </StrictMode>
)
