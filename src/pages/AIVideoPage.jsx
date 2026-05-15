import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Video, Wand2, Download, Upload } from 'lucide-react'
import { useStore } from '../store/useStore'
import { generateRunway, pollRunway, generateHiggsfield, pollHiggsfield } from '../lib/aiProviders'
import { Button, Select, Textarea, Spinner, Card } from '../components/UI'
import toast from 'react-hot-toast'

const PROVIDERS = [
  { value: 'runway', label: 'RunwayML' },
  { value: 'higgsfield', label: 'Higgsfield AI' },
]

const DURATIONS = [
  { value: '4', label: '4 segundos' },
  { value: '8', label: '8 segundos' },
  { value: '16', label: '16 segundos' },
]

export default function AIVideoPage() {
  const { t } = useTranslation()
  const { apiKeys } = useStore()
  const [provider, setProvider] = useState('runway')
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState('4')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [videoUrl, setVideoUrl] = useState(null)
  const [baseImage, setBaseImage] = useState(null)
  const fileRef = useRef(null)

  const apiKey = apiKeys[provider] || ''

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setBaseImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  const pollVideo = async (taskId, pollFn) => {
    let attempts = 0
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++
        setProgress(`Procesando... (${attempts * 5}s)`)
        try {
          const url = await pollFn(taskId, apiKey)
          if (url) {
            clearInterval(interval)
            resolve(url)
          } else if (attempts > 60) {
            clearInterval(interval)
            reject(new Error('Timeout: generación tardó más de 5 minutos'))
          }
        } catch (err) {
          clearInterval(interval)
          reject(err)
        }
      }, 5000)
    })
  }

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Ingresa un prompt')
    if (!apiKey) return toast.error(`Ingresa tu API Key de ${provider} en Configuración`)
    setLoading(true)
    setVideoUrl(null)
    setProgress('Iniciando generación...')
    try {
      let taskId, url
      if (provider === 'runway') {
        taskId = await generateRunway(prompt, apiKey, parseInt(duration))
        url = await pollVideo(taskId, pollRunway)
      } else {
        taskId = await generateHiggsfield(prompt, apiKey)
        url = await pollVideo(taskId, pollHiggsfield)
      }
      setVideoUrl(url)
      toast.success('¡Video generado exitosamente!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const downloadVideo = async () => {
    if (!videoUrl) return
    try {
      const res = await fetch(videoUrl)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `social-canvas-reel-${Date.now()}.mp4`
      a.click()
    } catch {
      window.open(videoUrl, '_blank')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          {t('video.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Genera clips de video IA para tus Reels de Instagram
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t('video.provider')}
              options={PROVIDERS}
              value={provider}
              onChange={setProvider}
            />
            <Select
              label={t('video.duration')}
              options={DURATIONS}
              value={duration}
              onChange={setDuration}
            />
          </div>

          <Textarea
            label={t('video.prompt')}
            placeholder="Ej: Una ciudad futurista al atardecer con luces de neón y autos voladores..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />

          {/* Optional base image */}
          <div>
            <label className="label">Imagen base (opcional)</label>
            <div
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-indigo-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {baseImage ? (
                <img src={baseImage} alt="Base" className="h-24 rounded-lg object-cover" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-sm text-slate-400">Arrastra o haz clic para subir imagen base</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {!apiKey && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
              ⚠️ {t('video.apiKeyRequired')} — ve a <strong>Configuración</strong> para ingresar tu key de {provider}
            </p>
          )}

          <Button onClick={generate} disabled={loading} className="w-full justify-center" size="lg">
            {loading ? (
              <><Spinner size="sm" /> {progress || t('video.generating')}</>
            ) : (
              <><Wand2 className="w-5 h-5" /> {t('video.generate')}</>
            )}
          </Button>
        </div>
      </Card>

      {/* Video result */}
      {videoUrl && (
        <Card>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Video generado</h3>
          <div className="rounded-xl overflow-hidden bg-black mb-4 aspect-video">
            <video src={videoUrl} controls className="w-full h-full" autoPlay loop />
          </div>
          <Button onClick={downloadVideo} className="w-full justify-center">
            <Download className="w-4 h-4" />
            {t('video.download')}
          </Button>
        </Card>
      )}

      {/* Provider info cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'RunwayML', desc: 'Gen-3 Turbo: videos de alta calidad text-to-video o image-to-video. Ideal para Reels cinematográficos.', color: 'from-blue-500 to-indigo-600', key: 'runway' },
          { name: 'Higgsfield AI', desc: 'Especializado en movimiento de personajes y escenas dinámicas. Excelente para contenido de moda y lifestyle.', color: 'from-purple-500 to-pink-600', key: 'higgsfield' },
        ].map((p) => (
          <div key={p.key} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gradient-to-r ${p.color} text-white text-xs font-medium mb-2`}>
              <Video className="w-3 h-3" />
              {p.name}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{p.desc}</p>
            {apiKeys[p.key] ? (
              <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                ✓ API Key configurada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 mt-2 text-xs text-slate-400">
                ○ Sin API Key
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
