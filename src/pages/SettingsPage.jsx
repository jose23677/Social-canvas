import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Eye, EyeOff, Save, Shield } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Button, Input, Card } from '../components/UI'
import toast from 'react-hot-toast'
import i18n from '../i18n'

const SERVICE_KEYS = [
  { id: 'stability', label: 'Stability AI Key', placeholder: 'sk-...', link: 'https://platform.stability.ai/account/keys', desc: 'Genera imágenes fotorrealistas con SDXL' },
  { id: 'google', label: 'Google AI Studio Key', placeholder: 'AIza...', link: 'https://aistudio.google.com/app/apikey', desc: 'Imagen 3.0 de Google para imágenes hiperrealistas' },
  { id: 'unsplash', label: 'Unsplash Access Key', placeholder: 'Access Key...', link: 'https://unsplash.com/oauth/applications', desc: 'Banco de imágenes profesionales gratuitas' },
  { id: 'midjourney', label: 'Midjourney Proxy Key', placeholder: 'Bearer token...', link: 'https://useapi.net', desc: 'Acceso a Midjourney vía proxy useapi.net' },
  { id: 'runway', label: 'RunwayML API Key', placeholder: 'key_...', link: 'https://app.runwayml.com/settings', desc: 'Generación de video IA Gen-3 Turbo' },
  { id: 'higgsfield', label: 'Higgsfield AI Key', placeholder: 'hf_...', link: 'https://app.higgsfield.ai/settings', desc: 'Videos con movimiento de personajes IA' },
]

const SUPABASE_KEYS = [
  { id: 'supabase_url', label: 'Supabase Project URL', placeholder: 'https://xxxx.supabase.co' },
  { id: 'supabase_key', label: 'Supabase Anon Key', placeholder: 'eyJ...' },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const { apiKeys, setApiKey, darkMode, toggleDarkMode, language, setLanguage } = useStore()
  const [visible, setVisible] = useState({})
  const [supabase, setSupabase] = useState({
    supabase_url: localStorage.getItem('supabase_url') || '',
    supabase_key: localStorage.getItem('supabase_key') || '',
  })

  const toggleVisible = (id) => setVisible((v) => ({ ...v, [id]: !v[id] }))

  const saveSettings = () => {
    localStorage.setItem('supabase_url', supabase.supabase_url)
    localStorage.setItem('supabase_key', supabase.supabase_key)
    toast.success(t('settings.saved') + ' ✓')
  }

  const toggleLang = () => {
    const next = language === 'es' ? 'en' : 'es'
    setLanguage(next)
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        {t('settings.title')}
      </h1>

      {/* Appearance */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">{t('settings.appearance')}</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.darkMode')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Activa el tema oscuro</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.language')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Español / English</p>
            </div>
            <button
              onClick={toggleLang}
              className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              {language === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}
            </button>
          </div>
        </div>
      </Card>

      {/* Service API Keys */}
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('settings.apiKeys')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {t('settings.keysStored')}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {SERVICE_KEYS.map(({ id, label, placeholder, link, desc }) => (
            <div key={id}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">
                  Obtener key ↗
                </a>
              </div>
              <div className="relative">
                <input
                  type={visible[id] ? 'text' : 'password'}
                  value={apiKeys[id] || ''}
                  onChange={(e) => setApiKey(id, e.target.value)}
                  placeholder={placeholder}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleVisible(id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {visible[id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Supabase Config */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Supabase (Auth & Storage)</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Configura tu proyecto de Supabase para habilitar autenticación y galería de proyectos.{' '}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">supabase.com ↗</a>
        </p>
        <div className="space-y-3">
          {SUPABASE_KEYS.map(({ id, label, placeholder }) => (
            <Input
              key={id}
              label={label}
              type="text"
              value={supabase[id]}
              onChange={(e) => setSupabase((s) => ({ ...s, [id]: e.target.value }))}
              placeholder={placeholder}
            />
          ))}
        </div>
      </Card>

      <Button onClick={saveSettings} className="w-full justify-center" size="lg">
        <Save className="w-4 h-4" />
        {t('settings.save')}
      </Button>

      {/* SQL Schema helper */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Setup SQL para Supabase</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Ejecuta este SQL en tu Supabase SQL Editor para crear las tablas necesarias:
        </p>
        <pre className="bg-slate-900 dark:bg-slate-950 text-green-400 text-xs rounded-lg p-4 overflow-x-auto text-left whitespace-pre">
{`-- API Keys table
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  key text not null unique,
  created_at timestamptz default now(),
  last_used_at timestamptz
);
alter table api_keys enable row level security;
create policy "Users manage own keys" on api_keys
  using (auth.uid() = user_id);

-- Projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text default 'Untitled',
  canvas_json jsonb,
  slides jsonb,
  format text default 'square',
  thumbnail text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table projects enable row level security;
create policy "Users manage own projects" on projects
  using (auth.uid() = user_id);`}
        </pre>
      </Card>
    </div>
  )
}
