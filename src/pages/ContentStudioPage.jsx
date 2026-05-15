import { useState } from 'react'
import { Sparkles, ChevronRight, CheckCircle, Loader2, Edit3, Star, Zap, LayoutGrid, Wand2, Brain, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { TEMPLATES } from '../lib/templates/botoxCarousel'
import { generatePollinationsUrl } from '../lib/aiProviders'
import { generateCarouselFromPrompt } from '../lib/aiCarouselGenerator'
import { useStore } from '../store/useStore'
import { Button, Card, Input, Select, cn } from '../components/UI'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const STEPS = ['mode', 'brand', 'generate', 'preview']

// ── Paletas premium ───────────────────────────────────────────────────────────
export const PALETTES = [
  {
    id: 'jmc-brand',
    name: '✦ Dr. Colmenarez',
    desc: 'Petróleo · Champagne · Crema',
    brand: true,
    logo: '/Social-canvas/logo-jmc-dark.png',
    logoLight: '/Social-canvas/logo-jmc-crema.png',
    colors: { bg: '#0C2530', bg2: '#050B14', accent: '#C4AA80', text: '#F5F0E8', dark: '#020608', white: '#F5F0E8' },
    preview: ['#0C2530', '#050B14', '#C4AA80', '#F5F0E8'],
    isDark: true,
  },
  { id: 'luxury-nude', name: '◇ Luxury Nude', desc: 'Champagne · Marfil · Dorado', colors: { bg: '#F7F3EE', bg2: '#E8D5BE', accent: '#C4A882', text: '#2A2520', dark: '#1A1510', white: '#FFFFFF' }, preview: ['#F7F3EE', '#E8D5BE', '#C4A882', '#2A2520'], isDark: false },
  { id: 'midnight-luxe', name: '◈ Midnight Luxe', desc: 'Negro obsidiana · Cobre · Crema', colors: { bg: '#0A0806', bg2: '#1A1410', accent: '#C47840', text: '#F0E8D8', dark: '#050302', white: '#F0E8D8' }, preview: ['#0A0806', '#1A1410', '#C47840', '#F0E8D8'], isDark: true },
  { id: 'mauve-luxe', name: '◉ Mauve Luxe', desc: 'Malva rosado · Nude cálido · Champagne', colors: { bg: '#F5EEF0', bg2: '#E8D4DC', accent: '#9E6B7A', text: '#2A1820', dark: '#1A0C12', white: '#FFFFFF' }, preview: ['#F5EEF0', '#E8D4DC', '#9E6B7A', '#2A1820'], isDark: false },
  { id: 'forest-noir', name: '◌ Forest Noir', desc: 'Verde profundo · Sage · Menta premium', colors: { bg: '#0A1A12', bg2: '#0F2218', accent: '#7AB898', text: '#E8F5EC', dark: '#040E08', white: '#E8F5EC' }, preview: ['#0A1A12', '#0F2218', '#7AB898', '#E8F5EC'], isDark: true },
  { id: 'pearl-blush', name: '✧ Pearl Blush', desc: 'Blanco perla · Blush suave · Rosa pálido', colors: { bg: '#FDF8F5', bg2: '#F5E8E2', accent: '#C89898', text: '#2A1818', dark: '#1A0E0E', white: '#FFFFFF' }, preview: ['#FDF8F5', '#F5E8E2', '#C89898', '#2A1818'], isDark: false },
  { id: 'midnight-ocean', name: '◎ Midnight Ocean', desc: 'Navy profundo · Azul hielo · Platino', colors: { bg: '#080F1E', bg2: '#0F1A30', accent: '#90B8D8', text: '#E8F0F8', dark: '#040810', white: '#E8F0F8' }, preview: ['#080F1E', '#0F1A30', '#90B8D8', '#E8F0F8'], isDark: true },
  { id: 'sage-gold', name: '◑ Sage & Gold', desc: 'Sage mineral · Beige orgánico · Oro natural', colors: { bg: '#EEF0EA', bg2: '#D8E0D0', accent: '#8A9065', text: '#1E2820', dark: '#0E1810', white: '#FFFFFF' }, preview: ['#EEF0EA', '#D8E0D0', '#8A9065', '#1E2820'], isDark: false },
  { id: 'warm-slate', name: '▣ Warm Slate', desc: 'Gris editorial · Topo · Platino cálido', colors: { bg: '#F2EFEC', bg2: '#E0DBD5', accent: '#8A807A', text: '#1E1A18', dark: '#0E0C0A', white: '#FFFFFF' }, preview: ['#F2EFEC', '#E0DBD5', '#8A807A', '#1E1A18'], isDark: false },
]

export const PALETTE_MAP = Object.fromEntries(PALETTES.map(p => [p.id, p.colors]))

const TONES = [
  { value: 'educational', label: '📚 Educativo — datos y ciencia' },
  { value: 'aspirational', label: '✨ Aspiracional — deseo y lujo' },
  { value: 'trust', label: '🛡 Confianza — derribar miedos' },
  { value: 'conversion', label: '🎯 Conversión — generar consultas' },
]

const AI_PROVIDERS = [
  { value: 'pollinations', label: '⚡ Pollinations AI (gratis, sin key)', keyLabel: null, keyPlaceholder: null, link: null },
  { value: 'groq', label: '🦙 Groq — Llama 3.3 70B (gratis con key)', keyLabel: 'Groq API Key', keyPlaceholder: 'gsk_...', link: 'https://console.groq.com/keys' },
  { value: 'claude', label: '🧠 Claude Haiku (Anthropic)', keyLabel: 'Anthropic API Key', keyPlaceholder: 'sk-ant-...', link: 'https://console.anthropic.com' },
  { value: 'openai', label: '💡 GPT-4o Mini (OpenAI)', keyLabel: 'OpenAI API Key', keyPlaceholder: 'sk-...', link: 'https://platform.openai.com/api-keys' },
]

const JMC_DEFAULTS = {
  doctor: 'Dr. José Colmenarez',
  handle: '@drcolmenarez',
  whatsapp: '',
  specialty: 'Medicina Estética de Alto Nivel',
  style: 'jmc-brand',
}

export default function ContentStudioPage() {
  const navigate = useNavigate()
  const { setSlides, setFormat, setCurrentSlide } = useStore()

  const [step, setStep] = useState('mode')
  // mode: 'template' | 'ai'
  const [mode, setMode] = useState('ai')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // AI prompt state
  const [aiTopic, setAiTopic] = useState('')
  const [aiExtra, setAiExtra] = useState('')
  const [aiTone, setAiTone] = useState('educational')
  const [aiProvider, setAiProvider] = useState('pollinations')
  const [aiKey, setAiKey] = useState('')
  const [showAiKey, setShowAiKey] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aiMeta, setAiMeta] = useState(null)

  // Brand
  const [brand, setBrand] = useState(JMC_DEFAULTS)

  // Generation
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [genStatus, setGenStatus] = useState('')
  const [generatedSlides, setGeneratedSlides] = useState([])

  const setBrandField = (k) => (e) => setBrand(s => ({ ...s, [k]: typeof e === 'string' ? e : e.target.value }))
  const activePalette = PALETTES.find(p => p.id === brand.style) || PALETTES[0]
  const pal = activePalette.colors

  const resolveCopy = (text) => {
    if (!text) return text
    return text
      .replace(/\{handle\}/g, brand.handle || '@tuclínica')
      .replace(/\{doctor\}/g, brand.doctor || 'Dr. Nombre')
      .replace(/\{whatsapp\}/g, brand.whatsapp || 'WhatsApp')
  }
  const resolveObj = (obj) => {
    if (!obj) return obj
    if (typeof obj === 'string') return resolveCopy(obj)
    if (Array.isArray(obj)) return obj.map(resolveObj)
    if (typeof obj === 'object') { const r = {}; for (const k in obj) r[k] = resolveObj(obj[k]); return r }
    return obj
  }

  // ── Generate from AI prompt ──────────────────────────────────────────────
  const generateFromAI = async () => {
    if (!aiTopic.trim()) return toast.error('Escribe el tema del carrusel')
    setGenerating(true)
    setGenProgress(0)
    setGenStatus('La IA está investigando y estructurando el contenido...')

    try {
      const { slides: aiSlides, meta } = await generateCarouselFromPrompt({
        topic: aiTopic,
        extraInfo: aiExtra,
        tone: aiTone,
        brand,
        aiProvider,
        apiKey: aiKey,
      })

      setAiMeta(meta)
      setGenStatus('Generando imágenes para cada slide...')

      const palette = PALETTE_MAP[brand.style] || PALETTE_MAP['luxury-nude']
      const results = []

      for (let i = 0; i < aiSlides.length; i++) {
        const slide = aiSlides[i]
        setGenStatus(`Generando imagen ${i + 1} de ${aiSlides.length}`)
        setGenProgress(Math.round((i / aiSlides.length) * 100))
        results.push({
          ...slide,
          elements: resolveObj(slide.elements),
          imageUrl: generatePollinationsUrl(slide.imagePrompt || slide.elements.label, slide.imageStyle || 'photorealistic', 820, 1024),
          palette,
          brandLogo: activePalette.isDark ? activePalette.logo : activePalette.logoLight,
          isDark: slide.isDark || activePalette.isDark,
        })
        await new Promise(r => setTimeout(r, 200))
      }

      setGenProgress(100)
      setGenStatus('¡Carrusel listo!')
      setGeneratedSlides(results)
      setGenerating(false)
      setStep('preview')
      toast.success(`¡${results.length} slides generados con IA!`)
    } catch (err) {
      setGenerating(false)
      toast.error('Error: ' + err.message)
    }
  }

  // ── Generate from template ───────────────────────────────────────────────
  const generateFromTemplate = async () => {
    if (!selectedTemplate) return
    setGenerating(true)
    setGenProgress(0)
    const slides = selectedTemplate.data.slides
    const palette = PALETTE_MAP[brand.style] || PALETTE_MAP['luxury-nude']
    const results = []

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      setGenStatus(`Generando slide ${i + 1} de ${slides.length}`)
      setGenProgress(Math.round((i / slides.length) * 100))
      results.push({
        ...slide,
        elements: resolveObj(slide.elements),
        imageUrl: generatePollinationsUrl(slide.imagePrompt, slide.imageStyle, 820, 1024),
        palette,
        brandLogo: activePalette.isDark ? activePalette.logo : activePalette.logoLight,
        isDark: slide.isDark || activePalette.isDark,
      })
      await new Promise(r => setTimeout(r, 280))
    }
    setGenProgress(100)
    setGenStatus('¡Carrusel listo!')
    setGeneratedSlides(results)
    setGenerating(false)
    setStep('preview')
    toast.success('¡Carrusel generado!')
  }

  const openInEditor = () => {
    setSlides(generatedSlides.map(() => null))
    setFormat('portrait')
    setCurrentSlide(0)
    navigate('/', { state: { studioSlides: generatedSlides } })
  }

  const bgClass = cn('min-h-screen', activePalette.isDark && step !== 'mode' ? 'bg-[#050B14]' : 'bg-gradient-to-b from-[#F7F3EE] to-white dark:from-slate-900 dark:to-slate-800')

  return (
    <div className={bgClass}>

      {/* ── Hero ── */}
      <div className={cn('relative overflow-hidden border-b', activePalette.isDark && step !== 'mode' ? 'border-[#C4AA80]/20 bg-[#0C2530]' : 'border-[#E8D5BE] dark:border-slate-700')}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: pal.accent }} />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-2xl opacity-10" style={{ background: pal.accent }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-10">
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-2" style={{ borderColor: pal.accent + '40' }}>
              <img src={activePalette.isDark && step !== 'mode' ? '/Social-canvas/logo-jmc-dark.png' : '/Social-canvas/logo-jmc-light.png'} alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4"
              style={{ background: pal.accent + '20', border: `1px solid ${pal.accent}40`, color: activePalette.isDark ? pal.accent : '#8C6B4A' }}>
              <Sparkles className="w-3.5 h-3.5" /> Creative Studio · IA Premium
            </div>
            <h1 className="text-4xl md:text-5xl font-light leading-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: activePalette.isDark && step !== 'mode' ? pal.white : '#2A2520' }}>
              Contenido que convierte.<br />
              <em style={{ color: pal.accent }}>Diseñado para viralizar.</em>
            </h1>
            <p className="text-base max-w-xl" style={{ color: activePalette.isDark && step !== 'mode' ? pal.accent + 'CC' : '#7A746E' }}>
              Describe tu tema y la IA crea el carrusel completo. O elige un template premium listo para publicar.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[{ key: 'mode', label: 'Modo' }, { key: 'brand', label: 'Marca' }, { key: 'generate', label: 'Generar' }, { key: 'preview', label: 'Preview' }].map((s, i) => {
            const idx = STEPS.indexOf(step); const sIdx = STEPS.indexOf(s.key)
            const done = sIdx < idx; const active = sIdx === idx
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <div className="w-10 h-px" style={{ background: done ? pal.accent : '#e2e8f0' }} />}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{ background: active ? pal.dark : done ? pal.accent + '25' : undefined, color: active ? pal.white : done ? pal.accent : '#94a3b8', border: active ? 'none' : `1px solid ${done ? pal.accent + '40' : '#e2e8f0'}` }}>
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                  {s.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── STEP 1: Mode selector ── */}
        {step === 'mode' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#2A2520] dark:text-white mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>¿Cómo quieres crear tu carrusel?</h2>
              <p className="text-[#7A746E] dark:text-slate-400 text-sm">Elige el modo que mejor se adapte a tus necesidades</p>
            </div>

            {/* Mode cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* ── AI Mode ── */}
              <button
                onClick={() => { setMode('ai'); setStep('brand') }}
                className={cn('relative text-left p-7 rounded-2xl border-2 transition-all overflow-hidden group hover:shadow-xl hover:-translate-y-1',
                  mode === 'ai' ? 'border-[#C4AA80]' : 'border-[#E8D5BE] dark:border-slate-700 hover:border-[#C4AA80]/60')}
                style={{ background: 'linear-gradient(135deg, #0C2530 0%, #1A3A4A 100%)' }}
              >
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
                    Describe el tema en tus palabras. La IA investiga, estructura y redacta los 10 slides completos con copy experto, datos reales y ángulo de conversión.
                  </p>
                  <ul className="space-y-2">
                    {['Investiga el tema automáticamente', 'Genera copy premium en segundos', 'Adapta el contenido a tu marca', 'Cualquier tema, sin límites'].map(t => (
                      <li key={t} className="flex items-center gap-2 text-xs text-[#F5F0E8]/70">
                        <span className="text-[#C4AA80]">✦</span>{t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-center gap-2 text-[#C4AA80] text-sm font-medium">
                    Comenzar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* ── Template Mode ── */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl border-2 border-[#E8D5BE] dark:border-slate-700 bg-white dark:bg-slate-800 mb-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-[#C4A882]/10 border border-[#C4A882]/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#C4A882]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2A2520] dark:text-white text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Templates Premium</p>
                      <p className="text-xs text-[#7A746E] dark:text-slate-400">Contenido ya estructurado por expertos</p>
                    </div>
                  </div>
                  <p className="text-[#7A746E] dark:text-slate-400 text-sm mb-4">Elige entre templates creados por directores creativos especializados en medicina estética.</p>
                </div>
                <div className="space-y-2">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} disabled={t.comingSoon}
                      onClick={() => { setMode('template'); setSelectedTemplate(t); setStep('brand') }}
                      className={cn('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                        t.comingSoon ? 'border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed' :
                          selectedTemplate?.id === t.id && mode === 'template' ? 'border-[#C4A882] bg-[#C4A882]/5' :
                            'border-[#E8D5BE] dark:border-slate-700 hover:border-[#C4A882]/50 hover:bg-[#F7F3EE] dark:hover:bg-slate-800')}>
                      <span className="text-lg w-8 text-center" style={{ color: t.color, fontFamily: 'Cormorant Garamond' }}>{t.emoji}</span>
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
          </div>
        )}

        {/* ── STEP 2: Brand + AI prompt (if mode=ai) ── */}
        {step === 'brand' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: activePalette.isDark ? pal.white : '#2A2520' }}>
                {mode === 'ai' ? 'Describe tu carrusel' : 'Configura tu marca'}
              </h2>
              <p className="text-sm" style={{ color: activePalette.isDark ? pal.accent + 'AA' : '#7A746E' }}>
                {mode === 'ai' ? 'La IA investigará el tema y creará copy premium personalizado con tu marca' : 'El template se genera con tu identidad profesional'}
              </p>
            </div>

            {/* ── AI Prompt section (solo en modo AI) ── */}
            {mode === 'ai' && (
              <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: pal.accent + '40', background: activePalette.isDark ? pal.bg2 : '#FDFAF7' }}>
                <div className="p-5 border-b" style={{ borderColor: pal.accent + '20' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5" style={{ color: pal.accent }} />
                    <h3 className="font-semibold" style={{ color: activePalette.isDark ? pal.white : '#2A2520', fontFamily: 'Cormorant Garamond, serif' }}>
                      Prompt del carrusel
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Main topic */}
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: pal.accent }}>
                        Tema principal *
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                        style={{
                          background: activePalette.isDark ? pal.bg : '#F7F3EE',
                          border: `1.5px solid ${pal.accent}40`,
                          color: activePalette.isDark ? pal.white : '#2A2520',
                          '--tw-ring-color': pal.accent,
                        }}
                        rows={3}
                        placeholder="Ej: Quiero un carrusel educativo sobre rellenos dérmicos con ácido hialurónico para mi clínica de medicina estética en Caracas. Trabajamos con productos Juvederm y Restylane."
                        value={aiTopic}
                        onChange={e => setAiTopic(e.target.value)}
                      />
                      <p className="text-xs mt-1.5" style={{ color: pal.accent + '80' }}>
                        Sé específico: menciona el tratamiento, tu audiencia objetivo, ciudad, productos o lo que quieras destacar
                      </p>
                    </div>

                    {/* Extra info */}
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: pal.accent }}>
                        Información adicional (opcional)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none transition-all"
                        style={{ background: activePalette.isDark ? pal.bg : '#F7F3EE', border: `1.5px solid ${pal.accent}30`, color: activePalette.isDark ? pal.white : '#2A2520' }}
                        rows={2}
                        placeholder="Ej: Quiero incluir estadísticas de satisfacción, el proceso de la cita, precios aproximados, y especialmente derribar el miedo al dolor..."
                        value={aiExtra}
                        onChange={e => setAiExtra(e.target.value)}
                      />
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: pal.accent }}>Tono del contenido</label>
                      <div className="grid grid-cols-2 gap-2">
                        {TONES.map(t => (
                          <button key={t.value} onClick={() => setAiTone(t.value)}
                            className="p-2.5 rounded-xl text-left text-xs transition-all"
                            style={{
                              border: `1.5px solid ${aiTone === t.value ? pal.accent : pal.accent + '25'}`,
                              background: aiTone === t.value ? pal.accent + '18' : 'transparent',
                              color: activePalette.isDark ? (aiTone === t.value ? pal.white : pal.accent + 'AA') : (aiTone === t.value ? '#2A2520' : '#7A746E'),
                              fontWeight: aiTone === t.value ? 600 : 400,
                            }}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced: AI provider + key */}
                <div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between px-5 py-3 text-xs transition-colors hover:opacity-80"
                    style={{ color: pal.accent + 'AA' }}>
                    <span className="uppercase tracking-widest font-medium">Motor de IA — configuración avanzada</span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showAdvanced && (
                    <div className="px-5 pb-5 space-y-3 border-t" style={{ borderColor: pal.accent + '20' }}>
                      <div className="pt-3">
                        <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: pal.accent }}>Motor IA</label>
                        <select
                          value={aiProvider}
                          onChange={e => setAiProvider(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                          style={{ background: activePalette.isDark ? pal.bg : '#F7F3EE', border: `1px solid ${pal.accent}30`, color: activePalette.isDark ? pal.white : '#2A2520' }}>
                          {AI_PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>
                      {aiProvider !== 'pollinations' && (() => {
                        const prov = AI_PROVIDERS.find(p => p.value === aiProvider)
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium uppercase tracking-widest" style={{ color: pal.accent }}>
                                {prov?.keyLabel || 'API Key'}
                              </label>
                              {prov?.link && (
                                <a href={prov.link} target="_blank" rel="noopener noreferrer"
                                  className="text-xs hover:underline" style={{ color: pal.accent + 'AA' }}>
                                  Obtener key gratis →
                                </a>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type={showAiKey ? 'text' : 'password'}
                                value={aiKey}
                                onChange={e => setAiKey(e.target.value)}
                                placeholder={prov?.keyPlaceholder || 'API Key...'}
                                className="w-full px-3 py-2 pr-10 rounded-lg text-sm focus:outline-none"
                                style={{ background: activePalette.isDark ? pal.bg : '#F7F3EE', border: `1px solid ${pal.accent}30`, color: activePalette.isDark ? pal.white : '#2A2520' }}
                              />
                              <button onClick={() => setShowAiKey(!showAiKey)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: pal.accent + '80' }}>
                                {showAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-xs mt-1" style={{ color: pal.accent + '60' }}>
                              La key se guarda solo en tu navegador — nunca sale de tu dispositivo
                            </p>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Brand config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: pal.accent }}>Tu marca</p>
                {[
                  { k: 'doctor', label: 'Nombre / Clínica', ph: 'Dr. José Colmenarez' },
                  { k: 'handle', label: 'Instagram', ph: '@drcolmenarez' },
                  { k: 'whatsapp', label: 'WhatsApp', ph: '+58 414 000 0000' },
                  { k: 'specialty', label: 'Especialidad', ph: 'Medicina Estética' },
                ].map(({ k, label, ph }) => (
                  <div key={k}>
                    <label className="block text-xs mb-1" style={{ color: activePalette.isDark ? pal.accent + 'AA' : '#7A746E' }}>{label}</label>
                    <input value={brand[k]} onChange={setBrandField(k)} placeholder={ph}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-all"
                      style={{ background: activePalette.isDark ? pal.bg : '#F7F3EE', border: `1px solid ${pal.accent}30`, color: activePalette.isDark ? pal.white : '#2A2520' }} />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: pal.accent }}>Paleta de colores</p>
                <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
                  {PALETTES.map(p => (
                    <button key={p.id} onClick={() => setBrand(s => ({ ...s, style: p.id }))}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border-2 text-left transition-all"
                      style={{ background: p.colors.bg, border: `2px solid ${brand.style === p.id ? p.colors.accent : 'transparent'}` }}>
                      <div className="flex gap-1 shrink-0">
                        {p.preview.map((c, i) => <div key={i} className="w-4 h-7 rounded shadow-sm" style={{ background: c }} />)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-semibold truncate" style={{ color: p.isDark ? p.colors.accent : p.colors.text }}>{p.name}</p>
                          {p.brand && <span className="text-[8px] px-1 py-0.5 rounded font-bold uppercase" style={{ background: p.colors.accent + '30', color: p.colors.accent }}>MARCA</span>}
                        </div>
                        <p className="text-[9px] truncate" style={{ color: p.isDark ? p.colors.accent + '70' : '#94a3b8' }}>{p.desc}</p>
                      </div>
                      {brand.style === p.id && <CheckCircle className="w-4 h-4 shrink-0" style={{ color: p.colors.accent }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Logo preview */}
            {activePalette.logo && (
              <div className="p-4 rounded-2xl flex items-center gap-4 border" style={{ borderColor: pal.accent + '30', background: activePalette.isDark ? pal.bg : '#FDFAF7' }}>
                <img src={activePalette.isDark ? activePalette.logo : (activePalette.logoLight || activePalette.logo)} alt="Logo" className="h-14 w-14 object-contain rounded-xl" />
                <div>
                  <p className="font-semibold text-sm" style={{ fontFamily: 'Cormorant Garamond, serif', color: activePalette.isDark ? pal.white : '#2A2520' }}>{brand.doctor}</p>
                  <p className="text-xs" style={{ color: pal.accent }}>{brand.specialty}</p>
                  <p className="text-xs mt-0.5" style={{ color: pal.accent + '70' }}>{brand.handle}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setStep('mode')}>← Volver</Button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{ background: pal.dark, color: pal.white }}
                onClick={() => setStep('generate')}>
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Generate ── */}
        {step === 'generate' && (
          <div className="max-w-lg mx-auto text-center space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: activePalette.isDark ? pal.white : '#2A2520' }}>
                {mode === 'ai' ? 'La IA construirá tu carrusel' : 'Todo listo para generar'}
              </h2>
              <p className="text-sm" style={{ color: activePalette.isDark ? pal.accent + 'AA' : '#7A746E' }}>
                {mode === 'ai'
                  ? 'Primero investiga y redacta el copy, luego genera las imágenes IA para cada slide'
                  : '10 slides · Imágenes IA · Copy de experto · Tu marca aplicada'}
              </p>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl border text-left space-y-2.5"
              style={{ borderColor: pal.accent + '30', background: activePalette.isDark ? pal.bg2 : '#FDFAF7' }}>
              {mode === 'ai' && aiTopic && (
                <div className="pb-2.5 border-b" style={{ borderColor: pal.accent + '20' }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: pal.accent + '80' }}>Tema</p>
                  <p className="text-sm" style={{ color: activePalette.isDark ? pal.white : '#2A2520' }}>{aiTopic.slice(0, 120)}{aiTopic.length > 120 ? '...' : ''}</p>
                </div>
              )}
              {[
                { k: mode === 'ai' ? 'Motor IA' : 'Template', v: mode === 'ai' ? AI_PROVIDERS.find(p => p.value === aiProvider)?.label?.split(' (')[0] : selectedTemplate?.title },
                { k: 'Tono', v: mode === 'ai' ? TONES.find(t => t.value === aiTone)?.label : 'Premium editorial' },
                { k: 'Médico', v: brand.doctor || '—' },
                { k: 'Paleta', v: activePalette.name },
              ].map(({ k, v }) => v && (
                <div key={k} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: pal.accent + '15' }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: pal.accent + '80' }}>{k}</span>
                  <span className="text-sm font-medium" style={{ color: activePalette.isDark ? pal.white : '#2A2520' }}>{v}</span>
                </div>
              ))}
            </div>

            {generating ? (
              <div className="space-y-5">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: pal.accent }} />
                  <span className="text-sm" style={{ color: activePalette.isDark ? pal.text : '#2A2520' }}>{genStatus}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: pal.accent + '25' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${genProgress}%`, background: `linear-gradient(90deg, ${pal.dark}, ${pal.accent})` }} />
                </div>
                <p className="text-xs" style={{ color: pal.accent + '70' }}>{genProgress}% completado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={mode === 'ai' ? generateFromAI : generateFromTemplate}
                  className="w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${pal.dark} 0%, ${pal.bg2} 50%, ${pal.accent} 100%)`, color: pal.white }}>
                  {mode === 'ai'
                    ? <><Brain className="w-5 h-5" /> Generar con IA ahora</>
                    : <><Sparkles className="w-5 h-5" /> Generar carrusel premium</>}
                </button>
                <Button variant="secondary" className="w-full justify-center" onClick={() => setStep('brand')}>← Editar configuración</Button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Preview ── */}
        {step === 'preview' && generatedSlides.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
                style={{ background: pal.accent + '20', border: `1px solid ${pal.accent}40`, color: activePalette.isDark ? pal.accent : '#6B4A2A' }}>
                <CheckCircle className="w-3.5 h-3.5" />
                {generatedSlides.length} slides {mode === 'ai' ? 'generados con IA' : 'listos'}
              </div>
              {aiMeta?.hook && (
                <p className="text-lg font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: activePalette.isDark ? pal.white : '#2A2520' }}>
                  "{aiMeta.hook}"
                </p>
              )}
              <h2 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: activePalette.isDark ? pal.white : '#2A2520' }}>
                Tu carrusel premium está listo
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={openInEditor}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium shadow-lg transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${pal.dark}, ${pal.accent})`, color: pal.white }}>
                <Edit3 className="w-4 h-4" /> Abrir en editor
              </button>
              <Button variant="secondary" className="gap-2" onClick={() => { setStep('mode'); setGeneratedSlides([]); setAiMeta(null) }}>
                <Sparkles className="w-4 h-4" /> Nuevo carrusel
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {generatedSlides.map((slide, i) => (
                <SlidePreviewCard key={i} slide={slide} index={i} palette={activePalette} />
              ))}
            </div>

            <CopySheet slides={generatedSlides} brand={brand} palette={activePalette} meta={aiMeta} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Slide Preview Card ────────────────────────────────────────────────────────
function SlidePreviewCard({ slide, index, palette }) {
  const pal = slide.palette || palette.colors
  const el = slide.elements || {}
  const isDark = slide.isDark ?? palette.isDark

  return (
    <div className="group relative rounded-xl overflow-hidden border hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
      style={{ background: slide.bgColor || pal.bg, aspectRatio: '4/5', borderColor: pal.accent + '30' }}>
      <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: isDark ? 0.25 : 0.40 }} loading="lazy" onError={(e) => { e.target.style.opacity = 0 }} />
      <div className="absolute inset-0" style={{ background: isDark ? `linear-gradient(to bottom, ${pal.bg}CC, ${pal.bg}F0)` : `linear-gradient(to bottom, ${pal.bg}99, ${pal.bg}F0 55%)` }} />
      <div className="relative h-full flex flex-col p-3">
        <div className="flex items-center justify-between">
          <span className="text-[8px] uppercase tracking-widest font-medium px-1.5 py-0.5 rounded" style={{ color: pal.accent, background: pal.accent + '20' }}>
            {typeof el.label === 'string' ? el.label.split('/')[0].trim().slice(0, 12) : `S${index + 1}`}
          </span>
          <span className="text-[8px] font-mono" style={{ color: pal.accent + '80' }}>{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="mt-auto">
          {(Array.isArray(el.headline) ? el.headline : [el.headline]).filter(Boolean).map((line, j) => (
            <p key={j} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '11px', color: isDark ? pal.white || '#F5F0E8' : pal.text, lineHeight: 1.2, fontWeight: 600 }}>{line}</p>
          ))}
          {el.accent && <p className="text-[7px] mt-1 uppercase tracking-wide" style={{ color: pal.accent }}>{typeof el.accent === 'string' ? el.accent.slice(0, 28) : ''}</p>}
        </div>
        <div className="flex items-end justify-between mt-2">
          <div className="w-6 h-px" style={{ background: pal.accent }} />
          {palette.logo && index === 9 && <img src={palette.logo} alt="" className="h-5 w-5 object-contain opacity-80 rounded" />}
        </div>
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
        <span className="text-white text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>Ver slide</span>
      </div>
    </div>
  )
}

// ── Copy Sheet ────────────────────────────────────────────────────────────────
function CopySheet({ slides, brand, palette, meta }) {
  const [open, setOpen] = useState(false)
  const pal = palette.colors

  const copyAll = () => {
    const text = slides.map((s, i) => {
      const el = s.elements
      const h = Array.isArray(el.headline) ? el.headline.join(' ') : el.headline
      return `--- SLIDE ${i + 1}: ${el.label || ''} ---\n${h || ''}\n${el.accent || ''}\n${el.body || ''}${el.bullets ? '\n' + (el.bullets || []).map(b => `• ${b}`).join('\n') : ''}${el.quote ? `\n"${el.quote}"` : ''}`
    }).join('\n\n')
    navigator.clipboard.writeText(text)
    toast.success('Copy copiado ✓')
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: pal.accent + '30', background: palette.isDark ? pal.bg2 : '#FDFAF7' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left" style={{ background: palette.isDark ? pal.bg : undefined }}>
        <div>
          <h3 className="font-semibold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: palette.isDark ? pal.white : '#2A2520' }}>Copy completo del carrusel</h3>
          <p className="text-xs mt-0.5" style={{ color: pal.accent + '80' }}>
            {meta?.topic ? `Tema: ${meta.topic} · ` : ''}Texto listo para copiar y programar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={e => { e.stopPropagation(); copyAll() }} className="text-xs px-3 py-1.5 rounded-lg border transition-colors" style={{ borderColor: pal.accent + '40', color: pal.accent, background: pal.accent + '10' }}>Copiar todo</button>
          <ChevronRight className={cn('w-4 h-4 transition-transform', open && 'rotate-90')} style={{ color: pal.accent }} />
        </div>
      </button>

      {open && (
        <div className="p-6 space-y-3 border-t" style={{ borderColor: pal.accent + '20' }}>
          {slides.map((s, i) => {
            const el = s.elements
            const h = Array.isArray(el.headline) ? el.headline.join(' ') : el.headline
            return (
              <div key={i} className="p-4 rounded-xl border" style={{ borderColor: pal.accent + '20', background: palette.isDark ? pal.bg : '#F7F3EE' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: pal.accent, color: pal.dark }}>{i + 1}</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: pal.accent }}>{el.label}</span>
                </div>
                <p className="font-semibold text-sm mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: palette.isDark ? pal.white : '#2A2520' }}>{h}</p>
                {el.accent && <p className="text-xs mb-1" style={{ color: pal.accent }}>{el.accent}</p>}
                {el.body && <p className="text-xs whitespace-pre-line" style={{ color: palette.isDark ? pal.text + 'CC' : '#7A746E' }}>{el.body}</p>}
                {el.bullets?.length > 0 && <ul className="mt-1 space-y-0.5">{el.bullets.map((b, j) => <li key={j} className="text-xs flex gap-2" style={{ color: palette.isDark ? pal.text + 'CC' : '#7A746E' }}><span style={{ color: pal.accent }}>·</span>{b}</li>)}</ul>}
                {el.quote && <p className="text-xs italic mt-1.5" style={{ color: pal.accent }}>"{el.quote}"</p>}
                {el.myths?.map((m, j) => <div key={j} className="mt-1 text-xs"><p className="line-through" style={{ color: '#94a3b8' }}>{m.myth}</p><p style={{ color: palette.isDark ? pal.text : '#6A746E' }}>{m.truth}</p></div>)}
              </div>
            )
          })}

          {/* Caption */}
          <div className="p-5 rounded-2xl border" style={{ borderColor: pal.accent + '40', background: `linear-gradient(135deg, ${pal.bg}, ${pal.bg2})` }}>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-3" style={{ color: pal.accent }}>Caption para Instagram</p>
            <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: palette.isDark ? pal.text : '#2A2520' }}>
              {meta?.caption || `¿Tienes dudas sobre este tema? 👇\n\nGuarda este carrusel y compártelo con alguien que lo necesite.\n\nAgenda tu valoración personalizada.\n👉 ${brand.handle || '@drcolmenarez'}\n\n${(meta?.hashtags || ['#MedicinaEstética', '#SkincarePremium', '#TratamientoFacial']).map(h => h.startsWith('#') ? h : '#' + h).join(' ')}`}
            </p>
            <button onClick={() => { navigator.clipboard.writeText(meta?.caption || ''); toast.success('Caption copiado ✓') }}
              className="mt-3 text-xs hover:underline" style={{ color: pal.accent }}>
              Copiar caption →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
