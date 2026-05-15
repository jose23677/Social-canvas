import { useState, useRef } from 'react'
import { Sparkles, ChevronRight, CheckCircle, Loader2, Download, Edit3, Play, Star, Zap, LayoutGrid } from 'lucide-react'
import { TEMPLATES } from '../lib/templates/botoxCarousel'
import { generatePollinationsUrl } from '../lib/aiProviders'
import { useStore } from '../store/useStore'
import { Button, Card, Input, Select, Spinner, cn } from '../components/UI'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const STEPS = ['template', 'brand', 'generate', 'preview']

const STYLE_OPTIONS = [
  { value: 'luxury-nude', label: '✦ Luxury Nude (Champagne · Dorado · Marfil)' },
  { value: 'dark-premium', label: '◈ Dark Premium (Negro · Oro · Blanco)' },
  { value: 'soft-pink', label: '◉ Soft Feminine (Rosa pálido · Beige · Crema)' },
  { value: 'clinical-white', label: '◌ Clinical Pure (Blanco · Azul hielo · Plata)' },
]

const PALETTE_MAP = {
  'luxury-nude':   { bg: '#F7F3EE', bg2: '#E8D5BE', accent: '#C4A882', text: '#2A2520', dark: '#2A2520' },
  'dark-premium':  { bg: '#1A1814', bg2: '#2A2520', accent: '#C4A882', text: '#F7F3EE', dark: '#0D0B09' },
  'soft-pink':     { bg: '#FDF6F3', bg2: '#F2E4DC', accent: '#C4927A', text: '#2A1F1A', dark: '#3D2B24' },
  'clinical-white':{ bg: '#F8FAFC', bg2: '#E8F0F8', accent: '#6B8CAE', text: '#1A2530', dark: '#0F1820' },
}

export default function ContentStudioPage() {
  const navigate = useNavigate()
  const { setSlides, setFormat, setCurrentSlide } = useStore()

  const [step, setStep] = useState('template')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [brand, setBrand] = useState({ doctor: '', handle: '', whatsapp: '', style: 'luxury-nude', specialty: 'Especialista en Medicina Estética' })
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [genStatus, setGenStatus] = useState('')
  const [generatedSlides, setGeneratedSlides] = useState([])
  const progressRef = useRef(null)

  const setBrandField = (k) => (e) => setBrand(s => ({ ...s, [k]: typeof e === 'string' ? e : e.target.value }))

  const resolveCopy = (text) => {
    if (!text) return text
    return text
      .replace(/\{handle\}/g, brand.handle || '@tuclínica')
      .replace(/\{doctor\}/g, brand.doctor || 'Dr. Nombre')
      .replace(/\{whatsapp\}/g, brand.whatsapp || '+1 000 000 0000')
  }

  const resolveObj = (obj) => {
    if (!obj) return obj
    if (typeof obj === 'string') return resolveCopy(obj)
    if (Array.isArray(obj)) return obj.map(resolveObj)
    if (typeof obj === 'object') {
      const r = {}
      for (const k in obj) r[k] = resolveObj(obj[k])
      return r
    }
    return obj
  }

  const generateCarousel = async () => {
    if (!selectedTemplate) return
    setGenerating(true)
    setGenProgress(0)
    const slides = selectedTemplate.data.slides
    const results = []

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      setGenStatus(`Generando slide ${i + 1} de ${slides.length} — ${slide.elements.label || ''}`)
      setGenProgress(Math.round(((i) / slides.length) * 100))

      const palette = PALETTE_MAP[brand.style] || PALETTE_MAP['luxury-nude']
      const imgUrl = generatePollinationsUrl(slide.imagePrompt, slide.imageStyle, 820, 1024)
      const resolvedElements = resolveObj(slide.elements)

      results.push({
        ...slide,
        elements: resolvedElements,
        imageUrl: imgUrl,
        palette,
      })

      // Small delay to show progress smoothly
      await new Promise(r => setTimeout(r, 300))
    }

    setGenProgress(100)
    setGenStatus('¡Carrusel generado!')
    setGeneratedSlides(results)
    setGenerating(false)
    setStep('preview')
    toast.success('¡10 slides listos para revisar!')
  }

  const openInEditor = () => {
    const canvasSlides = generatedSlides.map(s => null) // blank json, images loaded by editor
    setSlides(canvasSlides)
    setFormat('portrait')
    setCurrentSlide(0)
    navigate('/', { state: { studioSlides: generatedSlides } })
    toast.success('Abriendo en el editor...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F3EE] to-white dark:from-slate-900 dark:to-slate-800">

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[#E8D5BE] dark:border-slate-700">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C4A882]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E8D5BE]/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C4A882]/15 border border-[#C4A882]/30 text-[#8C6B4A] dark:text-[#C4A882] text-xs font-medium uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Creative Studio · IA Premium
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-[#2A2520] dark:text-white mb-4 leading-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Contenido que convierte.<br />
            <em className="text-[#C4A882]">Diseñado para viralizar.</em>
          </h1>
          <p className="text-[#7A746E] dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Templates de nivel internacional para medicina estética y beauty. Genera carruseles premium con IA en minutos. Listos para exportar.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-[#7A746E] dark:text-slate-400">
            {[
              { icon: Zap, text: 'Generación instantánea' },
              { icon: Star, text: 'Nivel editorial premium' },
              { icon: LayoutGrid, text: '10 slides listos para publicar' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-[#C4A882]" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[
            { key: 'template', label: 'Template' },
            { key: 'brand', label: 'Marca' },
            { key: 'generate', label: 'Generar' },
            { key: 'preview', label: 'Vista previa' },
          ].map((s, i) => {
            const idx = STEPS.indexOf(step)
            const sIdx = STEPS.indexOf(s.key)
            const done = sIdx < idx
            const active = sIdx === idx
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <div className={cn('w-12 h-px', done ? 'bg-[#C4A882]' : 'bg-slate-200 dark:bg-slate-700')} />}
                <div className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  active ? 'bg-[#2A2520] dark:bg-[#C4A882] text-white' :
                    done ? 'bg-[#C4A882]/20 text-[#8C6B4A] dark:text-[#C4A882]' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-400'
                )}>
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-4 h-4 flex items-center justify-center">{i + 1}</span>}
                  {s.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── STEP 1: Template selector ── */}
        {step === 'template' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#2A2520] dark:text-white mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Elige tu template
              </h2>
              <p className="text-[#7A746E] dark:text-slate-400 text-sm">Cada template incluye copy experto, dirección de arte y prompts IA optimizados</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  disabled={t.comingSoon}
                  onClick={() => { setSelectedTemplate(t); setStep('brand') }}
                  className={cn(
                    'relative text-left p-6 rounded-2xl border-2 transition-all group overflow-hidden',
                    t.comingSoon
                      ? 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
                      : selectedTemplate?.id === t.id
                        ? 'border-[#C4A882] bg-[#F7F3EE] dark:bg-slate-800 shadow-lg'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#C4A882]/50 hover:shadow-md'
                  )}
                >
                  {/* Decorative gradient */}
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2" style={{ background: t.color }} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl" style={{ color: t.color, fontFamily: 'Cormorant Garamond, serif' }}>{t.emoji}</span>
                      {t.comingSoon
                        ? <span className="text-[10px] uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">Próximamente</span>
                        : <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium" style={{ background: t.color + '20', color: t.color }}>{t.category}</span>
                      }
                    </div>
                    <h3 className="font-semibold text-[#2A2520] dark:text-white text-lg mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                      {t.title}
                    </h3>
                    <p className="text-xs text-[#7A746E] dark:text-slate-400">{t.subtitle}</p>
                    {!t.comingSoon && (
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-xs text-[#C4A882] font-medium">{t.slides} slides</span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        {t.tags?.map(tag => (
                          <span key={tag} className="text-[10px] text-[#7A746E] dark:text-slate-400 uppercase tracking-wide">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Brand config ── */}
        {step === 'brand' && (
          <div className="max-w-xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#2A2520] dark:text-white mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Personaliza tu marca
              </h2>
              <p className="text-[#7A746E] dark:text-slate-400 text-sm">El carrusel se genera con tu identidad profesional</p>
            </div>

            <Card className="space-y-5 border-[#E8D5BE] dark:border-slate-700">
              <Input
                label="Nombre del médico / clínica"
                placeholder="Dr. José Colmenarez"
                value={brand.doctor}
                onChange={setBrandField('doctor')}
              />
              <Input
                label="Instagram handle"
                placeholder="@drcolmenarez"
                value={brand.handle}
                onChange={setBrandField('handle')}
              />
              <Input
                label="WhatsApp (con código de país)"
                placeholder="+58 414 000 0000"
                value={brand.whatsapp}
                onChange={setBrandField('whatsapp')}
              />
              <Input
                label="Especialidad / Tagline"
                placeholder="Especialista en Medicina Estética"
                value={brand.specialty}
                onChange={setBrandField('specialty')}
              />
              <Select
                label="Paleta de colores"
                options={STYLE_OPTIONS}
                value={brand.style}
                onChange={setBrandField('style')}
              />

              {/* Palette preview */}
              <div>
                <label className="label">Vista previa de paleta</label>
                <div className="flex gap-2 mt-1">
                  {Object.values(PALETTE_MAP[brand.style] || PALETTE_MAP['luxury-nude']).map((color, i) => (
                    <div key={i} className="flex-1 h-8 rounded-lg border border-black/5 shadow-sm" style={{ background: color }} title={color} />
                  ))}
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setStep('template')}>
                ← Volver
              </Button>
              <Button className="flex-1 justify-center" onClick={() => setStep('generate')} style={{ background: '#2A2520' }}>
                Continuar → <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Generate ── */}
        {step === 'generate' && (
          <div className="max-w-lg mx-auto text-center space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-[#2A2520] dark:text-white mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Todo listo para generar
              </h2>
              <p className="text-[#7A746E] dark:text-slate-400 text-sm">El sistema generará 10 slides con imágenes IA, copy experto y diseño premium</p>
            </div>

            {/* Summary card */}
            <Card className="text-left border-[#E8D5BE] dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[#E8D5BE] dark:border-slate-700">
                <span className="text-xs text-[#7A746E] dark:text-slate-400 uppercase tracking-widest">Template</span>
                <span className="text-sm font-medium text-[#2A2520] dark:text-white">{selectedTemplate?.title}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E8D5BE] dark:border-slate-700">
                <span className="text-xs text-[#7A746E] dark:text-slate-400 uppercase tracking-widest">Médico</span>
                <span className="text-sm font-medium text-[#2A2520] dark:text-white">{brand.doctor || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E8D5BE] dark:border-slate-700">
                <span className="text-xs text-[#7A746E] dark:text-slate-400 uppercase tracking-widest">Instagram</span>
                <span className="text-sm font-medium text-[#2A2520] dark:text-white">{brand.handle || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-[#7A746E] dark:text-slate-400 uppercase tracking-widest">Paleta</span>
                <div className="flex gap-1">
                  {Object.values(PALETTE_MAP[brand.style] || {}).map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-black/10" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </Card>

            {generating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-[#2A2520] dark:text-white">
                  <Loader2 className="w-5 h-5 animate-spin text-[#C4A882]" />
                  <span className="text-sm">{genStatus}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#E8D5BE] dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C4A882] rounded-full transition-all duration-500"
                    style={{ width: `${genProgress}%` }}
                  />
                </div>
                <p className="text-xs text-[#7A746E] dark:text-slate-400">{genProgress}% completado · Generando imágenes con IA...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={generateCarousel}
                  className="w-full py-4 rounded-2xl text-white font-medium text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #2A2520 0%, #4A3828 50%, #C4A882 100%)' }}
                >
                  <Sparkles className="w-5 h-5" />
                  Generar carrusel premium
                </button>
                <Button variant="secondary" className="w-full justify-center" onClick={() => setStep('brand')}>
                  ← Editar configuración
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Preview ── */}
        {step === 'preview' && generatedSlides.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium mb-4">
                <CheckCircle className="w-3.5 h-3.5" />
                10 slides generados exitosamente
              </div>
              <h2 className="text-2xl font-semibold text-[#2A2520] dark:text-white mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Tu carrusel premium está listo
              </h2>
              <p className="text-[#7A746E] dark:text-slate-400 text-sm">Revisa cada slide, edita en el canvas o exporta directamente</p>
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={openInEditor}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #2A2520, #C4A882)' }}
              >
                <Edit3 className="w-4 h-4" />
                Abrir en editor
              </button>
              <Button variant="secondary" className="gap-2" onClick={() => { setStep('template'); setGeneratedSlides([]) }}>
                <Sparkles className="w-4 h-4" />
                Nuevo carrusel
              </Button>
            </div>

            {/* Slides grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {generatedSlides.map((slide, i) => (
                <SlidePreviewCard key={i} slide={slide} index={i} />
              ))}
            </div>

            {/* Copy sheet */}
            <CopySheet slides={generatedSlides} brand={brand} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Slide Preview Card ────────────────────────────────────────────────────
function SlidePreviewCard({ slide, index }) {
  const palette = slide.palette || {}
  const el = slide.elements || {}

  return (
    <div className="group relative rounded-xl overflow-hidden border border-[#E8D5BE] dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
      style={{ background: slide.bgColor || palette.bg || '#F7F3EE', aspectRatio: '4/5' }}
    >
      {/* AI Image as background */}
      <img
        src={slide.imageUrl}
        alt={`Slide ${index + 1}`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: slide.isDark ? 0.3 : 0.45 }}
        loading="lazy"
        onError={(e) => { e.target.style.opacity = 0 }}
      />

      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: slide.isDark
            ? 'linear-gradient(to bottom, rgba(42,37,32,0.7) 0%, rgba(42,37,32,0.85) 100%)'
            : 'linear-gradient(to bottom, rgba(247,243,238,0.6) 0%, rgba(247,243,238,0.92) 60%)',
        }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col p-3">
        {/* Slide number */}
        <div className="flex items-center justify-between mb-auto">
          <span className="text-[8px] uppercase tracking-widest font-medium px-1.5 py-0.5 rounded"
            style={{ color: palette.accent, background: palette.accent + '20' }}>
            {el.label?.split('/')[0]?.trim() || `Slide ${index + 1}`}
          </span>
          <span className="text-[8px] font-mono" style={{ color: palette.accent }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Headline */}
        <div className="mt-auto">
          {Array.isArray(el.headline) ? (
            <div>
              {el.headline.map((line, j) => (
                <p key={j} className="font-semibold leading-tight"
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: '12px',
                    color: slide.isDark ? palette.white : palette.text,
                    lineHeight: 1.2,
                  }}>
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p className="font-semibold text-[11px] leading-tight"
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                color: slide.isDark ? palette.white : palette.text,
              }}>
              {el.headline}
            </p>
          )}

          {/* Accent line */}
          {el.accent && (
            <p className="text-[7px] mt-1 uppercase tracking-wide"
              style={{ color: palette.accent }}>
              {typeof el.accent === 'string' ? el.accent.slice(0, 30) : ''}
            </p>
          )}
        </div>

        {/* Gold accent line */}
        <div className="w-8 h-px mt-2" style={{ background: palette.accent }} />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-xs font-medium px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
          Vista previa
        </span>
      </div>
    </div>
  )
}

// ── Copy Sheet (expandible) ────────────────────────────────────────────────
function CopySheet({ slides, brand }) {
  const [open, setOpen] = useState(false)

  const copyAll = () => {
    const text = slides.map((s, i) => {
      const el = s.elements
      const headline = Array.isArray(el.headline) ? el.headline.join(' ') : el.headline
      return `--- SLIDE ${i + 1}: ${el.label || ''} ---\n${headline}\n${el.accent || ''}\n${el.body || ''}`
    }).join('\n\n')
    navigator.clipboard.writeText(text)
    toast.success('Copy copiado al portapapeles ✓')
  }

  return (
    <Card className="border-[#E8D5BE] dark:border-slate-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="font-semibold text-[#2A2520] dark:text-white" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Copy completo del carrusel
          </h3>
          <p className="text-xs text-[#7A746E] dark:text-slate-400 mt-0.5">Texto listo para copiar, editar y programar</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); copyAll() }}
            className="text-xs text-[#C4A882] hover:underline px-3 py-1 rounded-lg border border-[#C4A882]/30 hover:bg-[#C4A882]/10 transition-colors">
            Copiar todo
          </button>
          <ChevronRight className={cn('w-4 h-4 text-slate-400 transition-transform', open && 'rotate-90')} />
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-[#E8D5BE] dark:border-slate-700 pt-4">
          {slides.map((s, i) => {
            const el = s.elements
            const headline = Array.isArray(el.headline) ? el.headline.join(' ') : el.headline
            return (
              <div key={i} className="p-4 rounded-xl border border-[#E8D5BE] dark:border-slate-700 bg-[#FDFAF7] dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: '#C4A882' }}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-[#C4A882] uppercase tracking-widest">{el.label}</span>
                </div>
                <p className="font-semibold text-[#2A2520] dark:text-white mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  {headline}
                </p>
                {el.accent && <p className="text-xs text-[#7A746E] dark:text-slate-400 mb-2">{el.accent}</p>}
                {el.body && <p className="text-xs text-[#7A746E] dark:text-slate-400 whitespace-pre-line">{el.body}</p>}
                {el.quote && <p className="text-xs italic text-[#C4A882] mt-2">{el.quote}</p>}
                {el.bullets && (
                  <ul className="mt-2 space-y-1">
                    {el.bullets.map((b, j) => (
                      <li key={j} className="text-xs text-[#7A746E] dark:text-slate-400 flex gap-2">
                        <span className="text-[#C4A882]">·</span>{b}
                      </li>
                    ))}
                  </ul>
                )}
                {el.myths && el.myths.map((m, j) => (
                  <div key={j} className="mt-2 text-xs">
                    <p className="text-slate-400 line-through">✗ {m.myth}</p>
                    <p className="text-[#7A746E] dark:text-slate-300">✓ {m.truth}</p>
                  </div>
                ))}
              </div>
            )
          })}

          {/* Caption Instagram */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#F7F3EE] to-[#E8D5BE] dark:from-slate-800 dark:to-slate-900 border border-[#C4A882]/30">
            <p className="text-xs font-medium text-[#C4A882] uppercase tracking-widest mb-2">Caption sugerido para Instagram</p>
            <p className="text-sm text-[#2A2520] dark:text-slate-200 whitespace-pre-line leading-relaxed">
              {`¿Cuántas de estas dudas tenías sobre el Botox? 👇

El 80% de mis pacientes nuevos llegan con al menos 3 de estos mitos en la cabeza.

La realidad: el botox moderno bien aplicado es invisible. No congela. No deforma. No envejece.

Solo... mejora.

Agenda tu valoración médica personalizada.
👉 Link en bio o escríbeme por WhatsApp.

${brand.handle || '@tuclínica'} · ${brand.doctor || 'Dr. Nombre'}

#BotoxPremium #MedicinaEstética #ToxinaBotulínica #BotoxNatural #BotoxPreventivo #SkincarePremium`}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(document.querySelector('.caption-text')?.innerText || '')
                toast.success('Caption copiado ✓')
              }}
              className="mt-3 text-xs text-[#C4A882] hover:underline"
            >
              Copiar caption →
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
