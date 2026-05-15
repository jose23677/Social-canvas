import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Save, Moon, Sun, Globe } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Button, Input, Card } from '../components/UI'
import toast from 'react-hot-toast'
import i18n from '../i18n'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { darkMode, toggleDarkMode, language, setLanguage } = useStore()
  const [supabase, setSupabase] = useState({
    supabase_url: localStorage.getItem('supabase_url') || '',
    supabase_key: localStorage.getItem('supabase_key') || '',
  })

  const saveSettings = () => {
    localStorage.setItem('supabase_url', supabase.supabase_url)
    localStorage.setItem('supabase_key', supabase.supabase_key)
    toast.success('Configuración guardada ✓')
  }

  const toggleLang = () => {
    const next = language === 'es' ? 'en' : 'es'
    setLanguage(next)
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        {t('settings.title')}
      </h1>

      {/* Apariencia */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">{t('settings.appearance')}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-4 h-4 text-slate-500" /> : <Sun className="w-4 h-4 text-slate-500" />}
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.darkMode')}</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${darkMode ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-500" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.language')}</p>
            </div>
            <button
              onClick={toggleLang}
              className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              {language === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
            </button>
          </div>
        </div>
      </Card>

      {/* Supabase */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Supabase — Auth y proyectos</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Necesario para guardar proyectos y sincronizar tu cuenta.{' '}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
            Crear cuenta gratis →
          </a>
        </p>
        <div className="space-y-3">
          <Input
            label="Project URL"
            type="text"
            value={supabase.supabase_url}
            onChange={(e) => setSupabase((s) => ({ ...s, supabase_url: e.target.value }))}
            placeholder="https://xxxx.supabase.co"
          />
          <Input
            label="Anon Key"
            type="password"
            value={supabase.supabase_key}
            onChange={(e) => setSupabase((s) => ({ ...s, supabase_key: e.target.value }))}
            placeholder="eyJ..."
          />
        </div>

        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">SQL para ejecutar en Supabase → SQL Editor:</p>
          <pre className="text-[10px] text-green-600 dark:text-green-400 overflow-x-auto whitespace-pre">{`create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null, key text not null unique,
  created_at timestamptz default now(),
  last_used_at timestamptz
);
alter table api_keys enable row level security;
create policy "own keys" on api_keys using (auth.uid() = user_id);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text default 'Untitled', canvas_json jsonb,
  slides jsonb, format text default 'square',
  thumbnail text, created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table projects enable row level security;
create policy "own projects" on projects using (auth.uid() = user_id);`}</pre>
        </div>
      </Card>

      <Button onClick={saveSettings} className="w-full justify-center" size="lg">
        <Save className="w-4 h-4" />
        Guardar configuración
      </Button>
    </div>
  )
}
