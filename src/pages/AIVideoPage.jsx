import { useState, useRef } from 'react'
import { Video, Wand2, Download, Upload, X, Sparkles, ChevronDown, ChevronUp, RefreshCw, ImageIcon } from 'lucide-react'
import { generateRunway, pollRunway, generateHiggsfield, pollHiggsfield, generatePollinationsUrl, fetchImageAsDataUrl } from '../lib/aiProviders'
import { Button, Select, Spinner, Card, cn } from '../components/UI'
import toast from 'react-hot-toast'

const LOCAL_KEYS = 'sc_inline_keys'
const loadKeys = () => { try { return JSON.parse(localStorage.getItem(LOCAL_KEYS) || '{}') } catch { return {} } }
const saveKeys = (k) => localStorage.setItem(LOCAL_KEYS, JSON.stringify(k))

const DURATIONS = [
  { value: '4', label: '4 segundos' },
  { value: '8', label: '8 segundos' },
  { value: '16', label: '16 segundos' },
]

const MOODS = [
  { value: 'cinematic', label: '🎬 Cinematográfico' },
  { value: 'dynamic', label: '⚡ Dinámico' },
  { value: 'smooth', label: '🌊 Suave / Fluido' },
  { value: 'dramatic', label: '🌑 Dramático' },
]

const MOOD_SUFFIX = {
  cinematic: 'cinematic camera movement, film look, dramatic lighting',
  dynamic: 'fast dynamic movement, energetic, vibrant',
  smooth: 'smooth slow motion, fluid movement, calm',
  dramatic: 'dramatic atmosphere, dark moody, intense',
}

export default function AIVideoPage() {
  const [prompt, setPrompt] = useState('')
  const [mood, setMood] = useState('cinematic')
  const [duration, setDuration] = useState('4')
  const [provider, setProvider] = useState('runway')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [videoUrl, setVideoUrl] = useState(null)
  const [refImage, setRefImage] = useState(null)
  const [previewImages, setPreviewImages] = useState([])
  const [showProviders, setShowProviders] = useState(false)
  const [inlineKeys, setInlineKeys] = useState(loadKeys)
  const fileRef = useRef(null)

  const setKey = (k, v) => { const u = { ...inlineKeys, [k]: v }; setInlineKeys(u); saveKeys(u) }
  const apiKey = inlineKeys[provider] || ''

  const handleRefImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setRefImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  // Genera preview de storyboard con Pollinations (siempre gratis)
  const generatePreview = async () => {
    if (!prompt.trim()) return toast.error('Escribe qué video quieres generar')
    setPreviewImages([])
    const frames = [
      `${prompt}, ${MOOD_SUFFIX[mood]}, frame 1, opening shot`,
      `${prompt}, ${MOOD_SUFFIX[mood]}, frame 2, mid shot`,
      `${prompt}, ${MOOD_SUFFIX[mood]}, frame 3, close up`,
      `${prompt}, ${MOOD_SUFFIX[mood]}, frame 4, closing shot`,
    ]
    const urls = frames.map(f => generatePollinationsUrl(f, 'cinematic', 768, 432))
    setPreviewImages(urls)
    toast.success('Storyboard generado — previsualiza tu reel')
  }

  const pollVideo = (taskId, pollFn) => new Promise((resolve, reject) => {
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const elapsed = attempts * 5
      setProgress(`Procesando... ${elapsed}s`)
      try {
        const url = await pollFn(taskId, apiKey)
        if (url) { clearInterval(interval); resolve(url) }
        else if (attempts > 72) { clearInterval(interval); reject(new Error('Tiempo agotado (6 min)')) }
      } catch (err) { clearInterval(interval); reject(err) }
    }, 5000)
  })

  const generateVideo = async () => {
    if (!prompt.trim()) return toast.error('Escribe qué video quieres generar')
    if (!apiKey) {
      setShowProviders(true)
      return toast.error(`Ingresa tu API Key de ${provider === 'runway' ? 'RunwayML' : 'Higgsfield'} en la sección de abajo`)
    }
    setLoading(true); setVideoUrl(null); setProgress('Iniciando...')
    try {
      const fullPrompt = `${prompt}, ${MOOD_SUFFIX[mood]}`
      let taskId, url
      if (provider === 'runway') {
        taskId = await generateRunway(fullPrompt, apiKey, parseInt(duration))
        url = await pollVideo(taskId, pollRunway)
      } else {
        taskId = await generateHiggsfield(fullPrompt, apiKey)
        url = await pollVideo(taskId, pollHiggsfield)
      }
      setVideoUrl(url)
      toast.success('¡Video generado exitosamente!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false); setProgress('') }
  }

  const downloadVideo = async () => {
    try {
      const res = await fetch(videoUrl)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `reel-${Date.now()}.mp4`
      a.click()
    } catch { window.open(videoUrl, '_blank') }
  }

  const PROVIDERS = [
    { value: 'runway', label: 'RunwayML Gen-3', link: 'https://app.runwayml.com/settings', ph: 'key_...', desc: 'Mejor calidad general' },
    { value: 'higgsfield', label: 'Higgsfield AI', link: 'https://app.higgsfield.ai/settings', ph: 'hf_...', desc: 'Movimiento de personajes' },
  ]

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          Generador de Reels IA
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Describe tu reel y visualiza el storyboard al instante. Genera el video final con tu proveedor preferido.
        </p>
      </div>

      <Card>
        <div className="space-y-5">

          {/* Prompt */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              ¿Qué reel quieres crear?
            </label>
            <textarea
              className="input resize-none w-full"
              rows={3}
              placeholder="Ej: Modelo de moda caminando por las calles de París al atardecer, colores vibrantes, cámara lenta..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Mood + Duración */}
          <div className="grid grid-cols-2 gap-3">
            <Select label="Estilo / Mood" options={MOODS} value={mood} onChange={setMood} />
            <Select label="Duración" options={DURATIONS} value={duration} onChange={setDuration} />
          </div>

          {/* Imagen de referencia */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Imagen de referencia (opcional) — para usar como primer frame
            </label>
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors',
                refImage
                  ? 'border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700'
              )}
              onClick={() => fileRef.current?.click()}
            >
              {refImage ? (
                <>
                  <img src={refImage} alt="Ref" className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Imagen de referencia lista</p>
                    <p className="text-xs text-slate-400">Se usará como frame inicial del video</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setRefImage(null) }} className="text-slate-400 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Sube imagen de referencia</p>
                    <p className="text-xs text-slate-400">JPG, PNG — opcional</p>
                  </div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleRefImage} />
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={generatePreview}
              disabled={loading || !prompt.trim()}
              className="justify-center"
            >
              <Sparkles className="w-4 h-4" />
              Ver storyboard gratis
            </Button>
            <Button
              onClick={generateVideo}
              disabled={loading || !prompt.trim()}
              className="justify-center"
            >
              {loading
                ? <><Spinner size="sm" /> {progress}</>
                : <><Wand2 className="w-4 h-4" /> Generar video</>
              }
            </Button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            El storyboard es gratuito e instantáneo • El video requiere API key de RunwayML o Higgsfield
          </p>
        </div>
      </Card>

      {/* Storyboard preview */}
      {previewImages.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Storyboard — previsualización de tu reel
            </h3>
            <button onClick={generatePreview} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700">
              <RefreshCw className="w-3.5 h-3.5" /> Regenerar
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {previewImages.map((url, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden aspect-video bg-slate-100 dark:bg-slate-900">
                <img src={url} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" loading="lazy"
                  onError={(e) => { e.target.src = `https://placehold.co/300x169/6366f1/white?text=Frame+${i+1}` }} />
                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                  {i === 0 ? 'Inicio' : i === 3 ? 'Final' : `Frame ${i + 1}`}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Usa "Generar video" con tu API key para crear el MP4 real de {duration} segundos
          </p>
        </Card>
      )}

      {/* Video resultado */}
      {videoUrl && (
        <Card>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">¡Tu reel está listo!</h3>
          <div className="rounded-xl overflow-hidden bg-black mb-4 aspect-video">
            <video src={videoUrl} controls className="w-full h-full" autoPlay loop />
          </div>
          <Button onClick={downloadVideo} className="w-full justify-center" size="lg">
            <Download className="w-4 h-4" /> Descargar MP4
          </Button>
        </Card>
      )}

      {/* Proveedores de video */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowProviders(!showProviders)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {apiKey ? `${provider === 'runway' ? 'RunwayML' : 'Higgsfield'} configurado` : 'Configurar proveedor de video'}
            </span>
          </div>
          {showProviders ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {showProviders && (
          <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700 pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PROVIDERS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setProvider(p.value)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all',
                    provider === p.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  )}
                >
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{p.label}</p>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </button>
              ))}
            </div>
            {PROVIDERS.map(p => provider === p.value && (
              <div key={p.value}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">API Key de {p.label}</label>
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">
                    Obtener key →
                  </a>
                </div>
                <input
                  type="password"
                  className="input"
                  placeholder={p.ph}
                  value={inlineKeys[p.value] || ''}
                  onChange={(e) => setKey(p.value, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
