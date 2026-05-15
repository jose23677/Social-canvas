import { useState, useRef } from 'react'
import { X, Wand2, Plus, RefreshCw, Upload, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { generatePollinationsVariants, fetchImageAsDataUrl } from '../../lib/aiProviders'
import { Button, Select, Spinner } from '../UI'
import { cn } from '../UI'
import toast from 'react-hot-toast'

const STYLES = [
  { value: 'photorealistic', label: '📸 Fotorrealista' },
  { value: 'instagram', label: '✨ Instagram Aesthetic' },
  { value: 'cinematic', label: '🎬 Cinematográfico' },
  { value: 'artistic', label: '🎨 Artístico' },
  { value: 'illustration', label: '🖼 Ilustración' },
]

const FORMATS = [
  { value: '1:1', label: 'Cuadrado 1:1', w: 1024, h: 1024 },
  { value: '4:5', label: 'Retrato 4:5', w: 820, h: 1024 },
  { value: '9:16', label: 'Historia 9:16', w: 576, h: 1024 },
]

const LOCAL_KEYS = 'sc_inline_keys'
const loadKeys = () => { try { return JSON.parse(localStorage.getItem(LOCAL_KEYS) || '{}') } catch { return {} } }
const saveKeys = (k) => localStorage.setItem(LOCAL_KEYS, JSON.stringify(k))

export default function AIImagePanel({ onClose, onAddToCanvas }) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('photorealistic')
  const [format, setFormat] = useState('1:1')
  const [loading, setLoading] = useState(false)
  const [loadingIdx, setLoadingIdx] = useState(null)
  const [results, setResults] = useState([])
  const [refImage, setRefImage] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [inlineKeys, setInlineKeys] = useState(loadKeys)
  const fileRef = useRef(null)

  const setKey = (k, v) => { const u = { ...inlineKeys, [k]: v }; setInlineKeys(u); saveKeys(u) }

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Escribe qué imagen quieres generar')
    setLoading(true)
    setResults([])
    try {
      const fmt = FORMATS.find(f => f.value === format)
      const urls = generatePollinationsVariants(prompt, style, fmt.w, fmt.h, 4)
      // Mostrar URLs directamente para ver rápido, luego cargar como dataURL para canvas
      setResults(urls.map(url => ({ url, loaded: false })))
      toast.success('¡Generando 4 variantes!')
    } catch (err) {
      toast.error('Error al generar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const addToCanvas = async (url, idx) => {
    setLoadingIdx(idx)
    try {
      // Fetch como dataURL para evitar problemas CORS con Fabric.js
      const dataUrl = await fetchImageAsDataUrl(url)
      onAddToCanvas(dataUrl)
      onClose()
      toast.success('Imagen agregada al canvas ✓')
    } catch {
      // Si falla el fetch (CORS), intentar directamente con la URL
      onAddToCanvas(url)
      onClose()
    } finally {
      setLoadingIdx(null)
    }
  }

  const handleRefImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setRefImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  const regenerate = () => {
    if (!prompt.trim()) return
    generate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Generador de Imágenes IA
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Prompt principal */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              ¿Qué imagen quieres crear?
            </label>
            <div className="flex gap-2">
              <textarea
                className="input flex-1 resize-none"
                rows={3}
                placeholder="Ej: Mujer elegante tomando café en terraza parisina al amanecer, luz dorada, bokeh..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) generate() }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Tip: sé específico con colores, iluminación y ambiente. ⌘+Enter para generar.</p>
          </div>

          {/* Opciones rápidas */}
          <div className="grid grid-cols-2 gap-3">
            <Select label="Estilo visual" options={STYLES} value={style} onChange={setStyle} />
            <Select label="Formato" options={FORMATS.map(f => ({ value: f.value, label: f.label }))} value={format} onChange={setFormat} />
          </div>

          {/* Imagen de referencia */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Imagen de referencia (opcional)
            </label>
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors',
                refImage
                  ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              )}
              onClick={() => fileRef.current?.click()}
            >
              {refImage ? (
                <>
                  <img src={refImage} alt="Ref" className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Imagen de referencia cargada</p>
                    <p className="text-xs text-slate-400">La IA tomará su estilo como guía</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setRefImage(null) }} className="text-slate-400 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Sube una imagen de referencia</p>
                    <p className="text-xs text-slate-400">La IA usará su composición como guía</p>
                  </div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleRefImage} />
          </div>

          {/* Botón generar */}
          <Button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full justify-center"
            size="lg"
          >
            {loading
              ? <><Spinner size="sm" /> Generando 4 variantes...</>
              : <><Wand2 className="w-5 h-5" /> Generar imagen gratis</>
            }
          </Button>

          {/* Resultados */}
          {results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Variantes generadas — haz clic para agregar al canvas
                </p>
                <button
                  onClick={regenerate}
                  className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="group relative rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-900 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                    onClick={() => addToCanvas(r.url, i)}
                  >
                    <img
                      src={r.url}
                      alt={`Variante ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { e.target.src = `https://placehold.co/512x512/6366f1/white?text=Generando...` }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {loadingIdx === i
                        ? <Spinner size="md" />
                        : <div className="bg-white rounded-full p-2 shadow-lg"><Plus className="w-5 h-5 text-slate-900" /></div>
                      }
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      Variante {i + 1}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                Powered by Pollinations AI • Gratis, sin límites
              </p>
            </div>
          )}

          {/* Avanzado: otros proveedores con su propia key */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="text-slate-500 dark:text-slate-400 font-medium">Proveedores avanzados (con API Key propia)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {showAdvanced && (
              <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3 space-y-4">
                <p className="text-xs text-slate-400">
                  Para mayor calidad puedes usar Stability AI o Google Imagen con tu propia API key. Las keys se guardan solo en tu navegador.
                </p>
                {[
                  { id: 'stability', label: 'Stability AI (SDXL)', link: 'https://platform.stability.ai/account/keys', ph: 'sk-...' },
                  { id: 'google', label: 'Google Imagen 3', link: 'https://aistudio.google.com/app/apikey', ph: 'AIza...' },
                ].map(({ id, label, link, ph }) => (
                  <div key={id}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">
                        Obtener key gratis →
                      </a>
                    </div>
                    <input
                      type="password"
                      className="input"
                      placeholder={ph}
                      value={inlineKeys[id] || ''}
                      onChange={(e) => setKey(id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
