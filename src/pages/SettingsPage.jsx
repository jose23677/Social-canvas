import { useState } from 'react'
import { Moon, Sun, Globe, Save, User, Palette } from 'lucide-react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'
import i18n from '../i18n'

const LANGS = [{ v: 'es', label: '🇪🇸 Español' }, { v: 'en', label: '🇺🇸 English' }]

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, language, setLanguage, user } = useStore()
  const [brand, setBrand] = useState({
    name: localStorage.getItem('brand_name') || '',
    handle: localStorage.getItem('brand_handle') || '',
    specialty: localStorage.getItem('brand_specialty') || '',
  })

  const save = () => {
    Object.entries(brand).forEach(([k, v]) => localStorage.setItem(`brand_${k}`, v))
    toast.success('Configuración guardada')
  }

  const toggleLang = (v) => { setLanguage(v); i18n.changeLanguage(v); localStorage.setItem('lang', v) }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Configuración</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Personaliza tu experiencia y datos de marca.</p>
      </div>

      {/* Appearance */}
      <Section title="Apariencia" icon={Palette}>
        <Row label="Tema" desc={darkMode ? 'Modo oscuro activo' : 'Modo claro activo'}>
          <button onClick={toggleDarkMode} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13, transition: 'all 0.2s' }}>
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            {darkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </Row>
        <Row label="Idioma" desc="Idioma de la interfaz">
          <div style={{ display: 'flex', gap: 8 }}>
            {LANGS.map(l => (
              <button key={l.v} onClick={() => toggleLang(l.v)}
                style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', border: `1px solid ${language === l.v ? 'var(--accent)' : 'var(--border)'}`, background: language === l.v ? 'var(--accent-glow)' : 'var(--bg-card)', color: language === l.v ? 'var(--accent-h)' : 'var(--text-2)', fontWeight: language === l.v ? 600 : 400 }}>
                {l.label}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Brand */}
      <Section title="Tu marca" icon={User}>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>
          Estos datos se aplican automáticamente en tus carruseles generados.
        </p>
        {[
          { k: 'name', label: 'Nombre / Clínica', ph: 'Dr. José Colmenarez' },
          { k: 'handle', label: 'Instagram', ph: '@drcolmenarez' },
          { k: 'specialty', label: 'Especialidad', ph: 'Medicina Estética' },
        ].map(({ k, label, ph }) => (
          <div key={k} style={{ marginBottom: 16 }}>
            <label className="label">{label}</label>
            <input className="input" value={brand[k]} placeholder={ph}
              onChange={e => setBrand(s => ({ ...s, [k]: e.target.value }))} />
          </div>
        ))}
        <button className="btn-primary" onClick={save} style={{ marginTop: 8 }}>
          <Save size={15} /> Guardar
        </button>
      </Section>

      {/* Account */}
      {user && (
        <Section title="Cuenta" icon={User}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--accent-h)' }}>
              {(user.user_metadata?.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{user.user_metadata?.name || 'Usuario'}</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{user.email}</p>
            </div>
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Icon size={16} style={{ color: 'var(--accent)' }} />
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h2>
      </div>
      <div className="card" style={{ padding: 24 }}>{children}</div>
    </div>
  )
}

function Row({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500 }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{desc}</p>}
      </div>
      {children}
    </div>
  )
}
