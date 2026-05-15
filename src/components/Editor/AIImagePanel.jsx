import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Wand2, Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { generateStability, generateGoogle, searchUnsplash, generateMidjourney, pollMidjourney } from '../../lib/aiProviders'
import { Button, Select, Textarea, Spinner, Tabs } from '../UI'
import toast from 'react-hot-toast'

const PROVIDERS = [
  { value: 'stability', label: 'Stability AI' },
  { value: 'google', label: 'Google Imagen' },
  { value: 'unsplash', label: 'Unsplash' },
  { value: 'midjourney', label: 'Midjourney' },
]

const STYLES = [
  { value: 'photorealistic', label: 'Fotorrealista' },
  { value: 'artistic', label: 'Artístico' },
  { value: 'cinematic', label: 'Cinematográfico' },
  { value: 'illustration', label: 'Ilustración' },
]

export default function AIImagePanel({ onClose, onAddToCanvas }) {
  const { t } = useTranslation()
  const { apiKeys } = useStore()
  const [provider, setProvider] = useState('stability')
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('photorealistic')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  const apiKey = apiKeys[provider] || ''

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Ingresa un prompt')
    if (!apiKey && provider !== 'unsplash') {
      return toast.error(t('ai.apiKeyRequired') + ` (${provider})`)
    }
    setLoading(true)
    try {
      if (provider === 'stability') {
        const img = await generateStability(prompt, style, apiKey)
        setResults([{ url: img, type: 'dataurl' }])
      } else if (provider === 'google') {
        const img = await generateGoogle(prompt, apiKey)
        setResults([{ url: img, type: 'dataurl' }])
      } else if (provider === 'unsplash') {
        if (!apiKey) return toast.error(t('ai.apiKeyRequired'))
        const imgs = await searchUnsplash(prompt, apiKey)
        setResults(imgs.map((i) => ({ url: i.url, thumb: i.thumb, credit: i.credit, type: 'url' })))
      } else if (provider === 'midjourney') {
        const jobId = await generateMidjourney(prompt, apiKey)
        toast.success('Job iniciado, esperando resultado...')
        let attempts = 0
        const interval = setInterval(async () => {
          attempts++
          const url = await pollMidjourney(jobId, apiKey)
          if (url) {
            clearInterval(interval)
            setResults([{ url, type: 'url' }])
            setLoading(false)
          } else if (attempts > 30) {
            clearInterval(interval)
            setLoading(false)
            toast.error('Timeout esperando resultado de Midjourney')
          }
        }, 5000)
        return
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      if (provider !== 'midjourney') setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-500" />
            {t('ai.title')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t('ai.provider')}
              options={PROVIDERS}
              value={provider}
              onChange={setProvider}
            />
            <Select
              label={t('ai.style')}
              options={STYLES}
              value={style}
              onChange={setStyle}
            />
          </div>

          <Textarea
            label={t('ai.prompt')}
            placeholder={t('ai.prompt')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />

          {!apiKey && provider !== 'unsplash' && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
              ⚠️ {t('ai.apiKeyRequired')} — ve a <strong>Configuración</strong> para ingresar tu key de {provider}
            </p>
          )}

          <Button onClick={generate} disabled={loading} className="w-full justify-center">
            {loading ? <><Spinner size="sm" /> {t('ai.generating')}</> : <><Wand2 className="w-4 h-4" /> {t('ai.generate')}</>}
          </Button>

          {/* Results */}
          {results.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t('ai.results')}</p>
              <div className="grid grid-cols-3 gap-2">
                {results.map((r, i) => (
                  <div key={i} className="group relative rounded-lg overflow-hidden aspect-square bg-slate-100 dark:bg-slate-900 cursor-pointer" onClick={() => { onAddToCanvas(r.url); onClose() }}>
                    <img src={r.type === 'dataurl' ? r.url : (r.thumb || r.url)} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white rounded-full p-1.5">
                        <Plus className="w-4 h-4 text-slate-900" />
                      </div>
                    </div>
                    {r.credit && (
                      <span className="absolute bottom-1 left-1 text-[9px] text-white bg-black/60 rounded px-1">
                        {r.credit}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
