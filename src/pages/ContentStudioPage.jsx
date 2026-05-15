import { useState, useRef } from 'react'
import {
  Sparkles, ChevronRight, CheckCircle, Loader2, Edit3,
  Wand2, Brain, ChevronDown, ChevronUp, Eye, EyeOff,
  Globe, Video, FileText, ExternalLink, ImageIcon,
} from 'lucide-react'
import { TEMPLATES } from '../lib/templates/botoxCarousel'
import { generatePollinationsUrl, generateMidjourney, pollMidjourney } from '../lib/aiProviders'
import { generateCarouselFromPrompt } from '../lib/aiCarouselGenerator'
import { extractFromUrl, extractFromYoutube, extractFromPdf } from '../lib/contentExtractor'
import { useStore } from '../store/useStore'
import { cn } from '../components/UI'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// ── Paletas ───────────────────────────────────────────────────────────────────
export const PALETTES = [
  { id: 'jmc-brand',      name: '✦ Dr. Colmenarez', desc: 'Petróleo · Champagne · Crema', brand: true, logo: '/Social-canvas/logo-jmc-dark.png', logoLight: '/Social-canvas/logo-jmc-crema.png', colors: { bg: '#0C2530', bg2: '#050B14', accent: '#C4AA80', text: '#F5F0E8', dark: '#020608', white: '#F5F0E8' }, preview: ['#0C2530','#050B14','#C4AA80','#F5F0E8'], isDark: true },
  { id: 'luxury-nude',    name: '◇ Luxury Nude',    desc: 'Champagne · Marfil · Dorado',   colors: { bg: '#F7F3EE', bg2: '#E8D5BE', accent: '#C4A882', text: '#2A2520', dark: '#1A1510', white: '#FFFFFF' }, preview: ['#F7F3EE','#E8D5BE','#C4A882','#2A2520'], isDark: false },
  { id: 'midnight-luxe',  name: '◈ Midnight Luxe',  desc: 'Obsidiana · Cobre · Crema',     colors: { bg: '#0A0806', bg2: '#1A1410', accent: '#C47840', text: '#F0E8D8', dark: '#050302', white: '#F0E8D8' }, preview: ['#0A0806','#1A1410','#C47840','#F0E8D8'], isDark: true },
  { id: 'mauve-luxe',     name: '◉ Mauve Luxe',     desc: 'Malva · Nude cálido · Champagne', colors: { bg: '#F5EEF0', bg2: '#E8D4DC', accent: '#9E6B7A', text: '#2A1820', dark: '#1A0C12', white: '#FFFFFF' }, preview: ['#F5EEF0','#E8D4DC','#9E6B7A','#2A1820'], isDark: false },
  { id: 'forest-noir',    name: '◌ Forest Noir',    desc: 'Verde profundo · Sage · Menta',  colors: { bg: '#0A1A12', bg2: '#0F2218', accent: '#7AB898', text: '#E8F5EC', dark: '#040E08', white: '#E8F5EC' }, preview: ['#0A1A12','#0F2218','#7AB898','#E8F5EC'], isDark: true },
  { id: 'pearl-blush',    name: '✧ Pearl Blush',    desc: 'Blanco perla · Blush · Rosa',    colors: { bg: '#FDF8F5', bg2: '#F5E8E2', accent: '#C89898', text: '#2A1818', dark: '#1A0E0E', white: '#FFFFFF' }, preview: ['#FDF8F5','#F5E8E2','#C89898','#2A1818'], isDark: false },
  { id: 'midnight-ocean', name: '◎ Midnight Ocean', desc: 'Navy · Azul hielo · Platino',    colors: { bg: '#080F1E', bg2: '#0F1A30', accent: '#90B8D8', text: '#E8F0F8', dark: '#040810', white: '#E8F0F8' }, preview: ['#080F1E','#0F1A30','#90B8D8','#E8F0F8'], isDark: true },
  { id: 'sage-gold',      name: '◑ Sage & Gold',    desc: 'Sage · Beige orgánico · Oro',    colors: { bg: '#EEF0EA', bg2: '#D8E0D0', accent: '#8A9065', text: '#1E2820', dark: '#0E1810', white: '#FFFFFF' }, preview: ['#EEF0EA','#D8E0D0','#8A9065','#1E2820'], isDark: false },
  { id: 'warm-slate',     name: '▣ Warm Slate',     desc: 'Gris editorial · Topo · Platino', colors: { bg: '#F2EFEC', bg2: '#E0DBD5', accent: '#8A807A', text: '#1E1A18', dark: '#0E0C0A', white: '#FFFFFF' }, preview: ['#F2EFEC','#E0DBD5','#8A807A','#1E1A18'], isDark: false },
]

export const PALETTE_MAP = Object.fromEntries(PALETTES.map(p => [p.id, p.colors]))

const TONES = [
  { value: 'educational',  label: '📚 Educativo — datos y ciencia' },
  { value: 'aspirational', label: '✨ Aspiracional — deseo y lujo' },
  { value: 'trust',        label: '🛡 Confianza — derribar miedos' },
  { value: 'conversion',   label: '🎯 Conversión — generar consultas' },
]

const AI_TEXT_PROVIDERS = [
  { value: 'pollinations', label: '⚡ Pollinations AI (gratis, sin key)', keyPlaceholder: null, link: null },
  { value: 'groq',         label: '🦙 Groq — Llama 3.3 (gratis con key)', keyPlaceholder: 'gsk_...', link: 'https://console.groq.com/keys' },
  { value: 'claude',       label: '🧠 Claude Haiku (Anthropic)',           keyPlaceholder: 'sk-ant-...', link: 'https://console.anthropic.com' },
  { value: 'openai',       label: '💡 GPT-4o Mini (OpenAI)',               keyPlaceholder: 'sk-...', link: 'https://platform.openai.com/api-keys' },
]

const INPUT_TYPES = [
  { value: 'prompt',   icon: Brain,    label: 'Texto' },
  { value: 'url',      icon: Globe,    label: 'URL Web' },
  { value: 'youtube',  icon: Video,    label: 'YouTube' },
  { value: 'pdf',      icon: FileText, label: 'PDF' },
]

const JMC_DEFAULTS = { doctor: 'Dr. José Colmenarez', handle: '@drcolmenarez', whatsapp: '', specialty: 'Medicina Estética de Alto Nivel', style: 'jmc-brand' }

// ── Main component ────────────────────────────────────────────────────────────
export default function ContentStudioPage() {
  const navigate = useNavigate()
  const { setSlides, setFormat, setCurrentSlide, setStudioSlides } = useStore()

  // Navigation
  const [step, setStep] = useState('mode')   // mode | brand | generate | preview
  const [mode, setMode] = useState('ai')     // ai | template
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // AI input
  const [inputType, setInputType] = useState('prompt')
  const [aiTopic, setAiTopic] = useState('')
  const [aiExtra, setAiExtra] = useState('')
  const [aiUrl, setAiUrl] = useState('')
  const [aiYoutubeUrl, setAiYoutubeUrl] = useState('')
  const [aiPdfFile, setAiPdfFile] = useState(null)
  const [extracted, setExtracted] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [aiTone, setAiTone] = useState('educational')

  // AI providers
  const [textProvider, setTextProvider] = useState('pollinations')
  const [textKey, setTextKey] = useState('')
  const [showTextKey, setShowTextKey] = useState(false)
  const [imageProvider, setImageProvider] = useState('flux')
  const [mjKey, setMjKey] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sc_inline_keys') || '{}').midjourney || '' } catch { return '' }
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Brand
  const [brand, setBrand] = useState(JMC_DEFAULTS)

  // Generation
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [slides, setGeneratedSlides] = useState([])
  const [meta, setMeta] = useState(null)

  // Preview modal
  const [modalIdx, setModalIdx] = useState(null)

  const pdfRef = useRef(null)

  const palette = PALETTES.find(p => p.id === brand.style) || PALETTES[0]
  const pal = palette.colors

  const setBrand_ = (k) => (e) => setBrand(s => ({ ...s, [k]: typeof e === 'string' ? e : e.target.value }))

  const resolveCopy = (v) => {
    if (!v) return v
    if (typeof v === 'string') return v.replace(/\{handle\}/g, brand.handle || '@tuclínica').replace(/\{doctor\}/g, brand.doctor || 'Dr.').replace(/\{whatsapp\}/g, brand.whatsapp || '')
    if (Array.isArray(v)) return v.map(resolveCopy)
    if (typeof v === 'object') { const r = {}; for (const k in v) r[k] = resolveCopy(v[k]); return r }
    return v
  }

  // ── Extract ─────────────────────────────────────────────────────────────
  const extract = async () => {
    setExtracting(true)
    try {
      let result
      if (inputType === 'url')     result = await extractFromUrl(aiUrl)
      if (inputType === 'youtube') result = await extractFromYoutube(aiYoutubeUrl)
      if (inputType === 'pdf')     result = await extractFromPdf(aiPdfFile)
      setExtracted(result)
      toast.success('Contenido extraído ✓')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setExtracting(false)
    }
  }

  // ── Generate image URL ───────────────────────────────────────────────────
  const getImageUrl = async (prompt, style) => {
    if (imageProvider === 'midjourney' && mjKey) {
      try {
        const jobId = await generateMidjourney(prompt, mjKey)
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 5000))
          const url = await pollMidjourney(jobId, mjKey)
          if (url) return url
        }
      } catch { /* fallback */ }
    }
    return generatePollinationsUrl(prompt, style || 'photorealistic', 820, 1024, 'flux')
  }

  // ── Generate from AI ─────────────────────────────────────────────────────
  const generateAI = async () => {
    let topic = aiTopic
    let extra = aiExtra

    if (inputType !== 'prompt') {
      if (!extracted) { await extract(); return }
      topic = extracted.title || extracted.fileName || aiUrl || aiYoutubeUrl || 'Carrusel'
      extra = (extracted.text || '') + (aiExtra ? '\n\n' + aiExtra : '')
    }

    if (!topic.trim() && !extra.trim()) {
      toast.error('Escribe el tema del carrusel')
      return
    }

    setGenerating(true)
    setProgress(0)
    setStatus('La IA está investigando y estructurando el contenido...')

    try {
      const { slides: aiSlides, meta: aiMeta } = await generateCarouselFromPrompt({
        topic: topic || 'Carrusel médico premium',
        extraInfo: extra,
        tone: aiTone,
        brand,
        aiProvider: textProvider,
        apiKey: textKey,
      })

      setMeta(aiMeta)
      const pal_ = PALETTE_MAP[brand.style] || PALETTE_MAP['luxury-nude']
      const results = []

      for (let i = 0; i < aiSlides.length; i++) {
        const s = aiSlides[i]
        setStatus(imageProvider === 'midjourney' ? `Midjourney: imagen ${i + 1}/${aiSlides.length}` : `Flux: imagen ${i + 1}/${aiSlides.length}`)
        setProgress(Math.round((i / aiSlides.length) * 100))
        const imageUrl = await getImageUrl(s.imagePrompt || s.elements?.label || topic, s.imageStyle)
        results.push({ ...s, elements: resolveCopy(s.elements), imageUrl, palette: pal_, isDark: s.isDark || palette.isDark, brandLogo: palette.isDark ? palette.logo : palette.logoLight })
        await new Promise(r => setTimeout(r, 100))
      }

      setProgress(100)
      setGeneratedSlides(results)
      setGenerating(false)
      setStep('preview')
      toast.success(`¡${results.length} slides generados!`)
    } catch (err) {
      setGenerating(false)
      toast.error(err.message)
    }
  }

  // ── Generate from template ───────────────────────────────────────────────
  const generateTemplate = async () => {
    if (!selectedTemplate) return
    setGenerating(true)
    setProgress(0)
    const tSlides = selectedTemplate.data.slides
    const pal_ = PALETTE_MAP[brand.style] || PALETTE_MAP['luxury-nude']
    const results = []

    for (let i = 0; i < tSlides.length; i++) {
      const s = tSlides[i]
      setStatus(`Generando slide ${i + 1}/${tSlides.length}`)
      setProgress(Math.round((i / tSlides.length) * 100))
      const imageUrl = generatePollinationsUrl(s.imagePrompt || 'premium medical aesthetic', s.imageStyle || 'luxury', 820, 1024, 'flux')
      results.push({ ...s, elements: resolveCopy(s.elements), imageUrl, palette: pal_, isDark: s.isDark || palette.isDark, brandLogo: palette.isDark ? palette.logo : palette.logoLight })
      await new Promise(r => setTimeout(r, 200))
    }

    setProgress(100)
    setGeneratedSlides(results)
    setGenerating(false)
    setStep('preview')
    toast.success('¡Carrusel listo!')
  }

  // ── Open in editor ───────────────────────────────────────────────────────
  const openInEditor = () => {
    setStudioSlides(slides)
    setSlides(slides.map(() => null))
    setFormat('portrait')
    setCurrentSlide(0)
    navigate('/')
  }

  const reset = () => { setStep('mode'); setGeneratedSlides([]); setMeta(null); setModalIdx(null) }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const inputStyle = { background: palette.isDark ? pal.bg : '#F7F3EE', border: `1.5px solid ${pal.accent}40`, color: palette.isDark ? pal.white : '#2A2520' }
  const labelStyle = { color: pal.accent }
  const textColor = { color: palette.isDark ? pal.white : '#2A2520' }

  return (
    <div style={{ minHeight: '100vh', background: palette.isDark && step !== 'mode' ? '#050B14' : undefined }}
      className={palette.isDark && step !== 'mode' ? '' : 'bg-gradient-to-b from-[#F7F3EE] to-white dark:from-slate-900 dark:to-slate-800'}>

      {/* Hero */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: `${pal.accent}30`, background: palette.isDark && step !== 'mode' ? '#0C2530' : undefined }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: pal.accent }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-2" style={{ borderColor: `${pal.accent}40` }}>
            <img src={palette.isDark && step !== 'mode' ? '/Social-canvas/logo-jmc-dark.png' : '/Social-canvas/logo-jmc-light.png'} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4" style={{ background: `${pal.accent}20`, border: `1px solid ${pal.accent}40`, color: palette.isDark ? pal.accent : '#8C6B4A' }}>
              <Sparkles className="w-3.5 h-3.5" /> Creative Studio · IA Premium
            </div>
            <h1 className="text-4xl md:text-5xl font-light leading-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', ...textColor }}>
              Contenido que convierte.<br /><em style={{ color: pal.accent }}>Diseñado para viralizar.</em>
            </h1>
            <p className="text-base max-w-xl" style={{ color: palette.isDark && step !== 'mode' ? `${pal.accent}CC` : '#7A746E' }}>
              Describe tu tema, pega una URL, sube un PDF o pon un YouTube — la IA crea los 10 slides completos.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[{k:'mode',l:'Modo'},{k:'brand',l:'Marca'},{k:'generate',l:'Generar'},{k:'preview',l:'Preview'}].map((s, i) => {
            const steps = ['mode','brand','generate','preview']
            const done = steps.indexOf(s.k) < steps.indexOf(step)
            const active = s.k === step
            return (
              <div key={s.k} className="flex items-center gap-2">
                {i > 0 && <div className="w-10 h-px" style={{ background: done ? pal.accent : '#e2e8f0' }} />}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{ background: active ? pal.dark : done ? `${pal.accent}25` : undefined, color: active ? pal.white : done ? pal.accent : '#94a3b8', border: active ? 'none' : `1px solid ${done ? `${pal.accent}40` : '#e2e8f0'}` }}>
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{i+1}</span>}
                  {s.l}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── STEP: mode ── */}
        {step === 'mode' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#2A2520] dark:text-white mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                ¿Cómo quieres crear tu carrusel?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* AI Mode */}
              <button
                onClick={() => { setMode('ai'); setStep('brand') }}
                className="text-left p-7 rounded-2xl border-2 transition-all overflow-hidden group hover:shadow-xl hover:-translate-y-1 relative"
                style={{ background: 'linear-gradient(135deg, #0C2530 0%, #1A3A4A 100%)', borderColor: '#C4AA8060' }}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 bg-[#C4AA80]" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#C4AA80]/20 border border-[#C4AA80]/30 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-[#C4AA80]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#F5F0E8] text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Prompt con IA</p>
                      <span className="text-[10px] bg-[#C4AA80]/20 text-[#C4AA80] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Recomendado</span>
                    </div>
                  </div>
                  <p className="text-[#C4AA80]/90 text-sm leading-relaxed mb-4">
                    Texto libre, URL web, video de YouTube o PDF — la IA investiga y crea los 10 slides con copy experto.
                  </p>
                  <ul className="space-y-1.5">
                    {['📝 Prompt de texto libre','🌐 URL de artículo o web','🎬 Video de YouTube','📄 Archivo PDF'].map(t => (
                      <li key={t} className="text-xs text-[#F5F0E8]/80">{t}</li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-center gap-2 text-[#C4AA80] text-sm font-medium">
                    Comenzar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Template Mode */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#2A2520] dark:text-white px-1 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Templates Premium
                </p>
                {TEMPLATES.map((t) => (
                  <button key={t.id} disabled={t.comingSoon}
                    onClick={() => { setMode('template'); setSelectedTemplate(t); setStep('brand') }}
                    className={cn('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      t.comingSoon ? 'border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed' :
                        selectedTemplate?.id === t.id && mode === 'template' ? 'border-[#C4A882] bg-[#C4A882]/5' :
                          'border-[#E8D5BE] dark:border-slate-700 hover:border-[#C4A882]/50 hover:bg-[#F7F3EE] dark:hover:bg-slate-800')}>
                    <span className="text-xl w-8 text-center" style={{ color: t.color, fontFamily: 'Cormorant Garamond' }}>{t.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#2A2520] dark:text-white">{t.title}</p>
                      <p className="text-xs text-[#7A746E] dark:text-slate-400">{t.subtitle}</p>
                    </div>
                    {t.comingSoon
                      ? <span className="text-[10px] text-slate-400 uppercase tracking-wide">Pronto</span>
                      : <ChevronRight className="w-4 h-4 text-[#C4A882]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: brand ── */}
        {step === 'brand' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', ...textColor }}>
                {mode === 'ai' ? 'Describe tu carrusel' : 'Configura tu marca'}
              </h2>
              <p className="text-sm" style={{ color: palette.isDark ? `${pal.accent}AA` : '#7A746E' }}>
                {mode === 'ai' ? 'La IA investigará el tema y creará copy premium con tu marca' : 'El template se genera con tu identidad profesional'}
              </p>
            </div>

            {/* AI Prompt section */}
            {mode === 'ai' && (
              <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: `${pal.accent}40`, background: palette.isDark ? pal.bg2 : '#FDFAF7' }}>
                <div className="p-5 space-y-4">

                  {/* Input type tabs */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-2" style={labelStyle}>Fuente del contenido</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {INPUT_TYPES.map(({ value, icon: Icon, label }) => (
                        <button key={value}
                          onClick={() => { setInputType(value); setExtracted(null) }}
                          className="flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs transition-all"
                          style={{
                            borderColor: inputType === value ? pal.accent : `${pal.accent}25`,
                            background: inputType === value ? `${pal.accent}18` : 'transparent',
                            color: inputType === value ? (palette.isDark ? pal.white : '#2A2520') : `${pal.accent}80`,
                            fontWeight: inputType === value ? 600 : 400,
                          }}>
                          <Icon className="w-4 h-4" />{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt input */}
                  {inputType === 'prompt' && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest mb-2" style={labelStyle}>Tema principal *</p>
                      <textarea className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none" style={inputStyle}
                        rows={3}
                        placeholder="Ej: Carrusel educativo sobre rellenos dérmicos para mi clínica en Caracas. Trabajamos con Juvederm y Restylane..."
                        value={aiTopic} onChange={e => setAiTopic(e.target.value)} />
                      <p className="text-xs mt-1.5" style={{ color: `${pal.accent}80` }}>Sé específico: tratamiento, audiencia, ciudad, productos</p>
                    </div>
                  )}

                  {/* URL input */}
                  {inputType === 'url' && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-widest" style={labelStyle}>URL del artículo</p>
                      <div className="flex gap-2">
                        <input type="url" className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle}
                          placeholder="https://ejemplo.com/articulo-botox"
                          value={aiUrl} onChange={e => { setAiUrl(e.target.value); setExtracted(null) }} />
                        <button onClick={extract} disabled={extracting || !aiUrl}
                          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                          style={{ background: pal.accent, color: pal.dark }}>
                          {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                          Leer
                        </button>
                      </div>
                      {extracted && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: `${pal.accent}15`, color: pal.accent }}>✓ URL leída — la IA usará este contenido</p>}
                    </div>
                  )}

                  {/* YouTube input */}
                  {inputType === 'youtube' && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-widest" style={labelStyle}>URL de YouTube</p>
                      <div className="flex gap-2">
                        <input type="url" className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle}
                          placeholder="https://youtube.com/watch?v=..."
                          value={aiYoutubeUrl} onChange={e => { setAiYoutubeUrl(e.target.value); setExtracted(null) }} />
                        <button onClick={extract} disabled={extracting || !aiYoutubeUrl}
                          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                          style={{ background: pal.accent, color: pal.dark }}>
                          {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                          Obtener
                        </button>
                      </div>
                      {extracted && (
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${pal.accent}15` }}>
                          {extracted.thumbnail && <img src={extracted.thumbnail} alt="" className="w-16 h-10 rounded object-cover" />}
                          <div>
                            <p className="text-xs font-semibold" style={textColor}>{extracted.title}</p>
                            <p className="text-xs" style={{ color: pal.accent }}>{extracted.author}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PDF input */}
                  {inputType === 'pdf' && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-widest" style={labelStyle}>Archivo PDF</p>
                      <div onClick={() => pdfRef.current?.click()}
                        className="border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all"
                        style={{ borderColor: aiPdfFile ? pal.accent : `${pal.accent}30`, background: aiPdfFile ? `${pal.accent}10` : 'transparent' }}>
                        <FileText className="w-6 h-6" style={{ color: pal.accent }} />
                        <p className="text-sm" style={{ color: `${pal.accent}${aiPdfFile ? 'FF' : '80'}` }}>
                          {aiPdfFile ? aiPdfFile.name : 'Haz clic para seleccionar PDF'}
                        </p>
                      </div>
                      <input ref={pdfRef} type="file" accept=".pdf" className="hidden"
                        onChange={e => { setAiPdfFile(e.target.files[0]); setExtracted(null) }} />
                      {aiPdfFile && !extracted && (
                        <button onClick={extract} disabled={extracting}
                          className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ background: pal.accent, color: pal.dark }}>
                          {extracting ? <><Loader2 className="w-4 h-4 animate-spin" /> Leyendo...</> : <><FileText className="w-4 h-4" /> Procesar PDF</>}
                        </button>
                      )}
                      {extracted && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: `${pal.accent}15`, color: pal.accent }}>✓ PDF procesado</p>}
                    </div>
                  )}

                  {/* Extra info */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-2" style={labelStyle}>Información adicional (opcional)</p>
                    <textarea className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none transition-all" style={{ ...inputStyle, border: `1.5px solid ${pal.accent}30` }}
                      rows={2}
                      placeholder="Estadísticas, casos específicos, puntos a enfatizar..."
                      value={aiExtra} onChange={e => setAiExtra(e.target.value)} />
                  </div>

                  {/* Tone */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-2" style={labelStyle}>Tono</p>
                    <div className="grid grid-cols-2 gap-2">
                      {TONES.map(t => (
                        <button key={t.value} onClick={() => setAiTone(t.value)}
                          className="p-2.5 rounded-xl text-left text-xs transition-all"
                          style={{ border: `1.5px solid ${aiTone === t.value ? pal.accent : `${pal.accent}25`}`, background: aiTone === t.value ? `${pal.accent}18` : 'transparent', color: palette.isDark ? (aiTone === t.value ? pal.white : `${pal.accent}AA`) : (aiTone === t.value ? '#2A2520' : '#7A746E'), fontWeight: aiTone === t.value ? 600 : 400 }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced settings (collapsed) */}
                <div className="border-t" style={{ borderColor: `${pal.accent}20` }}>
                  <button onClick={() => setShowAdvanced(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-3 text-xs hover:opacity-80 transition-opacity"
                    style={{ color: `${pal.accent}AA` }}>
                    <span className="uppercase tracking-widest font-medium">Configuración avanzada</span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvanced && (
                    <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: `${pal.accent}20` }}>
                      {/* Image provider */}
                      <div className="pt-3">
                        <p className="text-xs font-medium uppercase tracking-widest mb-2" style={labelStyle}>🖼 Imágenes IA</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { v: 'flux', label: '⚡ Flux (gratis)', desc: 'Pollinations · Sin key · Hiperrealista' },
                            { v: 'midjourney', label: '🎨 Midjourney', desc: 'Máxima calidad · useapi.net key' },
                          ].map(opt => (
                            <button key={opt.v} onClick={() => setImageProvider(opt.v)}
                              className="p-3 rounded-xl border-2 text-left transition-all"
                              style={{ borderColor: imageProvider === opt.v ? pal.accent : `${pal.accent}25`, background: imageProvider === opt.v ? `${pal.accent}15` : 'transparent' }}>
                              <p className="text-xs font-semibold" style={textColor}>{opt.label}</p>
                              <p className="text-[10px] mt-0.5" style={{ color: `${pal.accent}80` }}>{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                        {imageProvider === 'midjourney' && (
                          <div className="mt-2 space-y-1">
                            <input type="password" value={mjKey}
                              onChange={e => { setMjKey(e.target.value); const k = JSON.parse(localStorage.getItem('sc_inline_keys') || '{}'); k.midjourney = e.target.value; localStorage.setItem('sc_inline_keys', JSON.stringify(k)) }}
                              placeholder="Bearer token de useapi.net..."
                              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                              style={{ background: palette.isDark ? pal.bg : '#F7F3EE', border: `1px solid ${pal.accent}30`, color: palette.isDark ? pal.white : '#2A2520' }} />
                            <p className="text-xs" style={{ color: `${pal.accent}60` }}>⚠ Midjourney tarda ~2 min por imagen. El carrusel puede demorar 20+ min.</p>
                          </div>
                        )}
                      </div>

                      {/* Text provider */}
                      <div>
                        <p className="text-xs font-medium uppercase tracking-widest mb-2" style={labelStyle}>🧠 Motor de texto IA</p>
                        <select value={textProvider} onChange={e => setTextProvider(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none mb-2"
                          style={{ background: palette.isDark ? pal.bg : '#F7F3EE', border: `1px solid ${pal.accent}30`, color: palette.isDark ? pal.white : '#2A2520' }}>
                          {AI_TEXT_PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        {textProvider !== 'pollinations' && (() => {
                          const prov = AI_TEXT_PROVIDERS.find(p => p.value === textProvider)
                          if (!prov) return null
                          return (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs" style={{ color: `${pal.accent}80` }}>API Key</span>
                                {prov.link && <a href={prov.link} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: pal.accent }}>Obtener →</a>}
                              </div>
                              <div className="relative">
                                <input type={showTextKey ? 'text' : 'password'} value={textKey}
                                  onChange={e => setTextKey(e.target.value)}
                                  placeholder={prov.keyPlaceholder || ''}
                                  className="w-full px-3 py-2 pr-10 rounded-lg text-sm focus:outline-none"
                                  style={{ background: palette.isDark ? pal.bg : '#F7F3EE', border: `1px solid ${pal.accent}30`, color: palette.isDark ? pal.white : '#2A2520' }} />
                                <button onClick={() => setShowTextKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: `${pal.accent}80` }}>
                                  {showTextKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Brand fields + palette */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest" style={labelStyle}>Tu marca</p>
                {[
                  { k:'doctor', label:'Nombre / Clínica', ph:'Dr. José Colmenarez' },
                  { k:'handle', label:'Instagram', ph:'@drcolmenarez' },
                  { k:'whatsapp', label:'WhatsApp', ph:'+58 414 000 0000' },
                  { k:'specialty', label:'Especialidad', ph:'Medicina Estética' },
                ].map(({ k, label, ph }) => (
                  <div key={k}>
                    <label className="block text-xs mb-1" style={{ color: palette.isDark ? `${pal.accent}AA` : '#7A746E' }}>{label}</label>
                    <input value={brand[k]} onChange={setBrand_(k)} placeholder={ph}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-all"
                      style={{ background: palette.isDark ? pal.bg : '#F7F3EE', border: `1px solid ${pal.accent}30`, color: palette.isDark ? pal.white : '#2A2520' }} />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-widest" style={labelStyle}>Paleta</p>
                <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1">
                  {PALETTES.map(p => (
                    <button key={p.id} onClick={() => setBrand(s => ({...s, style: p.id}))}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border-2 text-left transition-all"
                      style={{ background: p.colors.bg, borderColor: brand.style === p.id ? p.colors.accent : 'transparent' }}>
                      <div className="flex gap-1 shrink-0">{p.preview.map((c,i)=><div key={i} className="w-4 h-7 rounded shadow-sm" style={{background:c}}/>)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-semibold truncate" style={{ color: p.isDark ? p.colors.accent : p.colors.text }}>{p.name}</p>
                          {p.brand && <span className="text-[8px] px-1 py-0.5 rounded font-bold uppercase" style={{ background: `${p.colors.accent}30`, color: p.colors.accent }}>MARCA</span>}
                        </div>
                        <p className="text-[9px] truncate" style={{ color: p.isDark ? `${p.colors.accent}70` : '#94a3b8' }}>{p.desc}</p>
                      </div>
                      {brand.style === p.id && <CheckCircle className="w-4 h-4 shrink-0" style={{ color: p.colors.accent }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Logo preview */}
            {palette.logo && (
              <div className="p-4 rounded-2xl flex items-center gap-4 border" style={{ borderColor: `${pal.accent}30`, background: palette.isDark ? pal.bg : '#FDFAF7' }}>
                <img src={palette.isDark ? palette.logo : (palette.logoLight || palette.logo)} alt="" className="h-14 w-14 object-contain rounded-xl" />
                <div>
                  <p className="font-semibold text-sm" style={{ fontFamily: 'Cormorant Garamond, serif', ...textColor }}>{brand.doctor}</p>
                  <p className="text-xs" style={{ color: pal.accent }}>{brand.specialty}</p>
                  <p className="text-xs mt-0.5" style={{ color: `${pal.accent}70` }}>{brand.handle}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('mode')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all" style={{ borderColor: `${pal.accent}40`, color: pal.accent }}>
                ← Volver
              </button>
              <button onClick={() => setStep('generate')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{ background: pal.dark, color: pal.white }}>
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: generate ── */}
        {step === 'generate' && (
          <div className="max-w-lg mx-auto text-center space-y-8">
            <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', ...textColor }}>
              {mode === 'ai' ? 'La IA construirá tu carrusel' : 'Todo listo para generar'}
            </h2>

            {/* Summary */}
            <div className="p-5 rounded-2xl border text-left space-y-2" style={{ borderColor: `${pal.accent}30`, background: palette.isDark ? pal.bg2 : '#FDFAF7' }}>
              {[
                { k: 'Modo', v: mode === 'ai' ? `Prompt IA · ${INPUT_TYPES.find(t => t.value === inputType)?.label}` : selectedTemplate?.title },
                { k: 'Imágenes', v: imageProvider === 'midjourney' ? '🎨 Midjourney' : '⚡ Flux (hiperrealista)' },
                { k: 'Tono', v: TONES.find(t => t.value === aiTone)?.label },
                { k: 'Médico', v: brand.doctor || '—' },
                { k: 'Paleta', v: palette.name },
              ].filter(x => x.v).map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: `${pal.accent}15` }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: `${pal.accent}80` }}>{k}</span>
                  <span className="text-sm font-medium" style={textColor}>{v}</span>
                </div>
              ))}
            </div>

            {generating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: pal.accent }} />
                  <span className="text-sm" style={textColor}>{status}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: `${pal.accent}25` }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${pal.dark}, ${pal.accent})` }} />
                </div>
                <p className="text-xs" style={{ color: `${pal.accent}70` }}>{progress}% completado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button onClick={mode === 'ai' ? generateAI : generateTemplate}
                  className="w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${pal.dark} 0%, ${pal.bg2} 50%, ${pal.accent} 100%)`, color: pal.white }}>
                  {mode === 'ai' ? <><Brain className="w-5 h-5" /> Generar con IA ahora</> : <><Sparkles className="w-5 h-5" /> Generar carrusel premium</>}
                </button>
                <button onClick={() => setStep('brand')} className="w-full py-2.5 rounded-xl text-sm font-medium border transition-all" style={{ borderColor: `${pal.accent}40`, color: pal.accent }}>
                  ← Editar configuración
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: preview ── */}
        {step === 'preview' && slides.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
                style={{ background: `${pal.accent}20`, border: `1px solid ${pal.accent}40`, color: palette.isDark ? pal.accent : '#6B4A2A' }}>
                <CheckCircle className="w-3.5 h-3.5" />
                {slides.length} slides generados
              </div>
              {meta?.hook && <p className="text-lg font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', ...textColor }}>"{meta.hook}"</p>}
              <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif', ...textColor }}>Tu carrusel premium está listo</h2>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={openInEditor}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium shadow-lg transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${pal.dark}, ${pal.accent})`, color: pal.white }}>
                <Edit3 className="w-4 h-4" /> Abrir en editor
              </button>
              <button onClick={reset}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all hover:scale-105"
                style={{ borderColor: `${pal.accent}50`, color: pal.accent }}>
                <Sparkles className="w-4 h-4" /> Nuevo carrusel
              </button>
            </div>

            {/* Slides grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {slides.map((s, i) => (
                <SlideCard key={i} slide={s} index={i} palette={palette} onClick={() => setModalIdx(i)} />
              ))}
            </div>

            <CopySheet slides={slides} brand={brand} palette={palette} meta={meta} />
          </div>
        )}
      </div>

      {/* Slide modal */}
      {modalIdx !== null && slides.length > 0 && (
        <SlideModal slides={slides} idx={modalIdx} setIdx={setModalIdx} palette={palette} onClose={() => setModalIdx(null)} />
      )}
    </div>
  )
}

// ── Slide Card ─────────────────────────────────────────────────────────────────
function SlideCard({ slide, index, palette, onClick }) {
  const pal = slide.palette || palette.colors
  const el = slide.elements || {}
  const isDark = slide.isDark ?? palette.isDark
  const headline = Array.isArray(el.headline) ? el.headline : [el.headline].filter(Boolean)

  return (
    <div onClick={onClick} className="group relative rounded-xl overflow-hidden border cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
      style={{ background: slide.bgColor || pal.bg, aspectRatio: '4/5', borderColor: `${pal.accent}30` }}>
      <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: isDark ? 0.25 : 0.40 }} loading="lazy" onError={e => { e.target.style.opacity = 0 }} />
      <div className="absolute inset-0" style={{ background: isDark ? `linear-gradient(to bottom, ${pal.bg}CC, ${pal.bg}F0)` : `linear-gradient(to bottom, ${pal.bg}99, ${pal.bg}F0 55%)` }} />
      <div className="relative h-full flex flex-col p-3">
        <div className="flex items-center justify-between">
          <span className="text-[8px] uppercase tracking-widest font-medium px-1.5 py-0.5 rounded" style={{ color: pal.accent, background: `${pal.accent}20` }}>
            {typeof el.label === 'string' ? el.label.split('/')[0].trim().slice(0, 12) : `S${index+1}`}
          </span>
          <span className="text-[8px] font-mono" style={{ color: `${pal.accent}80` }}>{String(index+1).padStart(2,'0')}</span>
        </div>
        <div className="mt-auto">
          {headline.map((line, j) => (
            <p key={j} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '11px', color: isDark ? pal.white || '#F5F0E8' : pal.text, lineHeight: 1.2, fontWeight: 600 }}>{line}</p>
          ))}
          {el.accent && typeof el.accent === 'string' && (
            <p className="text-[7px] mt-1 uppercase tracking-wide" style={{ color: pal.accent }}>{el.accent.slice(0, 28)}</p>
          )}
        </div>
        <div className="flex items-end justify-between mt-2">
          <div className="w-6 h-px" style={{ background: pal.accent }} />
          {palette.logo && index === 9 && <img src={palette.logo} alt="" className="h-5 w-5 object-contain opacity-80 rounded" />}
        </div>
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <span className="text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
          <Wand2 className="w-3.5 h-3.5" /> Ver slide
        </span>
      </div>
    </div>
  )
}

// ── Slide Modal ────────────────────────────────────────────────────────────────
function SlideModal({ slides, idx, setIdx, palette, onClose }) {
  const slide = slides[idx]
  if (!slide) return null
  const pal = slide.palette || palette.colors
  const el = slide.elements || {}
  const isDark = slide.isDark ?? palette.isDark
  const headline = Array.isArray(el.headline) ? el.headline : [el.headline].filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-sm" onClick={e => e.stopPropagation()}>
        {/* Arrows */}
        <button disabled={idx === 0} onClick={() => setIdx(i => i - 1)}
          className="absolute -left-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-30 text-xl transition-all">‹</button>
        <button disabled={idx === slides.length - 1} onClick={() => setIdx(i => i + 1)}
          className="absolute -right-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-30 text-xl transition-all">›</button>

        {/* Slide */}
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: slide.bgColor || pal.bg, aspectRatio: '4/5', position: 'relative' }}>
          {slide.imageUrl && (
            <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: isDark ? 0.3 : 0.45 }} onError={e => { e.target.style.opacity = 0 }} />
          )}
          <div className="absolute inset-0" style={{ background: isDark ? `linear-gradient(160deg, ${pal.bg}AA, ${pal.bg}F5)` : `linear-gradient(160deg, ${pal.bg}88, ${pal.bg}F0 65%)` }} />

          <div className="relative h-full flex flex-col p-7">
            {el.label && typeof el.label === 'string' && (
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium px-2.5 py-1 rounded-full self-start mb-2"
                style={{ color: pal.accent, background: `${pal.accent}20`, border: `0.5px solid ${pal.accent}40` }}>
                {el.label.split('/')[0].trim()}
              </span>
            )}
            <div className="w-10 h-0.5 mb-4 mt-1" style={{ background: pal.accent }} />

            <div className="mb-3">
              {headline.map((line, j) => (
                <p key={j} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '28px', color: isDark ? pal.white || '#F5F0E8' : pal.text, lineHeight: 1.15, fontWeight: 600 }}>{line}</p>
              ))}
            </div>

            {el.accent && typeof el.accent === 'string' && (
              <p className="text-sm italic mb-3" style={{ color: pal.accent, fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{el.accent.slice(0, 80)}</p>
            )}
            {el.body && typeof el.body === 'string' && (
              <p className="text-xs leading-relaxed mb-3" style={{ color: isDark ? `${pal.text}DD` : `${pal.text}CC`, fontWeight: 300 }}>
                {el.body.slice(0, 200)}{el.body.length > 200 ? '…' : ''}
              </p>
            )}
            {Array.isArray(el.bullets) && el.bullets.length > 0 && (
              <ul className="space-y-1.5 mb-3">
                {el.bullets.slice(0, 4).map((b, i) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: isDark ? `${pal.text}DD` : `${pal.text}CC`, fontWeight: 300 }}>
                    <span style={{ color: pal.accent }}>·</span>{String(b).slice(0, 60)}
                  </li>
                ))}
              </ul>
            )}
            {el.quote && typeof el.quote === 'string' && (
              <p className="text-sm italic mt-auto" style={{ color: pal.accent, fontFamily: 'Cormorant Garamond, serif' }}>"{el.quote.slice(0, 100)}"</p>
            )}
            <div className="mt-auto flex items-center gap-3 pt-3 border-t" style={{ borderColor: `${pal.accent}25` }}>
              <div className="w-8 h-0.5" style={{ background: pal.accent }} />
              {(el.handle || el.ctaInstagram) && (
                <span className="text-[10px] uppercase tracking-widest" style={{ color: pal.accent }}>{String(el.handle || el.ctaInstagram || '').slice(0, 25)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Dots + close */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === idx ? pal.accent : 'rgba(255,255,255,0.4)', transform: i === idx ? 'scale(1.4)' : 'scale(1)' }} />
            ))}
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xs">Cerrar ✕</button>
        </div>
      </div>
    </div>
  )
}

// ── Copy Sheet ─────────────────────────────────────────────────────────────────
function CopySheet({ slides, brand, palette, meta }) {
  const [open, setOpen] = useState(false)
  const pal = palette.colors

  const copyAll = () => {
    const text = slides.map((s, i) => {
      const el = s.elements || {}
      const h = Array.isArray(el.headline) ? el.headline.join(' ') : (el.headline || '')
      const bullets = Array.isArray(el.bullets) ? el.bullets.map(b => `• ${b}`).join('\n') : ''
      return `--- SLIDE ${i+1}: ${el.label || ''} ---\n${h}\n${el.accent || ''}\n${el.body || ''}${bullets ? '\n' + bullets : ''}${el.quote ? `\n"${el.quote}"` : ''}`
    }).join('\n\n')
    navigator.clipboard.writeText(text)
    toast.success('Copy copiado ✓')
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${pal.accent}30`, background: palette.isDark ? pal.bg2 : '#FDFAF7' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-6 py-4 text-left"
        style={{ background: palette.isDark ? pal.bg : undefined }}>
        <div>
          <h3 className="font-semibold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: palette.isDark ? pal.white : '#2A2520' }}>
            Copy completo del carrusel
          </h3>
          <p className="text-xs mt-0.5" style={{ color: `${pal.accent}80` }}>
            {meta?.topic ? `${meta.topic} · ` : ''}Texto listo para copiar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={e => { e.stopPropagation(); copyAll() }}
            className="text-xs px-3 py-1.5 rounded-lg border"
            style={{ borderColor: `${pal.accent}40`, color: pal.accent, background: `${pal.accent}10` }}>
            Copiar todo
          </button>
          <ChevronRight className={cn('w-4 h-4 transition-transform', open && 'rotate-90')} style={{ color: pal.accent }} />
        </div>
      </button>

      {open && (
        <div className="p-6 space-y-3 border-t" style={{ borderColor: `${pal.accent}20` }}>
          {slides.map((s, i) => {
            const el = s.elements || {}
            const h = Array.isArray(el.headline) ? el.headline.join(' ') : (el.headline || '')
            return (
              <div key={i} className="p-4 rounded-xl border" style={{ borderColor: `${pal.accent}20`, background: palette.isDark ? pal.bg : '#F7F3EE' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: pal.accent, color: pal.dark }}>{i+1}</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: pal.accent }}>{el.label || ''}</span>
                </div>
                <p className="font-semibold text-sm mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: palette.isDark ? pal.white : '#2A2520' }}>{h}</p>
                {el.accent && <p className="text-xs mb-1" style={{ color: pal.accent }}>{el.accent}</p>}
                {el.body && <p className="text-xs whitespace-pre-line" style={{ color: palette.isDark ? `${pal.text}CC` : '#7A746E' }}>{el.body}</p>}
                {Array.isArray(el.bullets) && el.bullets.map((b, j) => <p key={j} className="text-xs flex gap-2" style={{ color: palette.isDark ? `${pal.text}CC` : '#7A746E' }}><span style={{color:pal.accent}}>·</span>{b}</p>)}
                {el.quote && <p className="text-xs italic mt-1" style={{ color: pal.accent }}>"{el.quote}"</p>}
                {Array.isArray(el.myths) && el.myths.map((m, j) => <div key={j} className="mt-1"><p className="text-xs line-through" style={{color:'#94a3b8'}}>{m.myth}</p><p className="text-xs" style={{color:palette.isDark?pal.text:'#6A746E'}}>{m.truth}</p></div>)}
              </div>
            )
          })}

          {/* Caption */}
          <div className="p-5 rounded-2xl border" style={{ borderColor: `${pal.accent}40`, background: `linear-gradient(135deg, ${pal.bg}, ${pal.bg2})` }}>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-3" style={{ color: pal.accent }}>Caption Instagram</p>
            <p id="studio-caption" className="text-sm whitespace-pre-line leading-relaxed" style={{ color: palette.isDark ? pal.text : '#2A2520' }}>
              {meta?.caption || `¿Tienes dudas sobre este tema? 👇\n\nGuarda este carrusel y compártelo.\n\nAgenda tu valoración personalizada.\n👉 ${brand.handle || '@drcolmenarez'}\n\n${(meta?.hashtags || ['#MedicinaEstética','#SkincarePremium']).map(h => h.startsWith('#') ? h : '#'+h).join(' ')}`}
            </p>
            <button
              onClick={() => { const el = document.getElementById('studio-caption'); navigator.clipboard.writeText(el?.innerText || meta?.caption || ''); toast.success('Caption copiado ✓') }}
              className="mt-3 text-xs hover:underline" style={{ color: pal.accent }}>
              Copiar caption →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
