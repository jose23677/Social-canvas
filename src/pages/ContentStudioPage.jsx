import { useState, useRef } from 'react'
import { Sparkles, ChevronRight, CheckCircle, Loader2, Edit3, Star, Zap, LayoutGrid } from 'lucide-react'
import { TEMPLATES } from '../lib/templates/botoxCarousel'
import { generatePollinationsUrl } from '../lib/aiProviders'
import { useStore } from '../store/useStore'
import { Button, Card, Input, Select, Spinner, cn } from '../components/UI'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const STEPS = ['template', 'brand', 'generate', 'preview']

// ── Paletas premium ─────────────────────────────────────────────────────────
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
  {
    id: 'luxury-nude',
    name: '◇ Luxury Nude',
    desc: 'Champagne · Marfil · Dorado',
    colors: { bg: '#F7F3EE', bg2: '#E8D5BE', accent: '#C4A882', text: '#2A2520', dark: '#1A1510', white: '#FFFFFF' },
    preview: ['#F7F3EE', '#E8D5BE', '#C4A882', '#2A2520'],
    isDark: false,
  },
  {
    id: 'midnight-luxe',
    name: '◈ Midnight Luxe',
    desc: 'Negro obsidiana · Cobre · Crema',
    colors: { bg: '#0A0806', bg2: '#1A1410', accent: '#C47840', text: '#F0E8D8', dark: '#050302', white: '#F0E8D8' },
    preview: ['#0A0806', '#1A1410', '#C47840', '#F0E8D8'],
    isDark: true,
  },
  {
    id: 'mauve-luxe',
    name: '◉ Mauve Luxe',
    desc: 'Malva rosado · Nude cálido · Champagne',
    colors: { bg: '#F5EEF0', bg2: '#E8D4DC', accent: '#9E6B7A', text: '#2A1820', dark: '#1A0C12', white: '#FFFFFF' },
    preview: ['#F5EEF0', '#E8D4DC', '#9E6B7A', '#2A1820'],
    isDark: false,
  },
  {
    id: 'forest-noir',
    name: '◌ Forest Noir',
    desc: 'Verde profundo · Sage · Menta premium',
    colors: { bg: '#0A1A12', bg2: '#0F2218', accent: '#7AB898', text: '#E8F5EC', dark: '#040E08', white: '#E8F5EC' },
    preview: ['#0A1A12', '#0F2218', '#7AB898', '#E8F5EC'],
    isDark: true,
  },
  {
    id: 'pearl-blush',
    name: '✧ Pearl Blush',
    desc: 'Blanco perla · Blush suave · Rosa pálido',
    colors: { bg: '#FDF8F5', bg2: '#F5E8E2', accent: '#C89898', text: '#2A1818', dark: '#1A0E0E', white: '#FFFFFF' },
    preview: ['#FDF8F5', '#F5E8E2', '#C89898', '#2A1818'],
    isDark: false,
  },
  {
    id: 'midnight-ocean',
    name: '◎ Midnight Ocean',
    desc: 'Navy profundo · Azul hielo · Platino',
    colors: { bg: '#080F1E', bg2: '#0F1A30', accent: '#90B8D8', text: '#E8F0F8', dark: '#040810', white: '#E8F0F8' },
    preview: ['#080F1E', '#0F1A30', '#90B8D8', '#E8F0F8'],
    isDark: true,
  },
  {
    id: 'sage-gold',
    name: '◑ Sage & Gold',
    desc: 'Sage mineral · Beige orgánico · Oro natural',
    colors: { bg: '#EEF0EA', bg2: '#D8E0D0', accent: '#8A9065', text: '#1E2820', dark: '#0E1810', white: '#FFFFFF' },
    preview: ['#EEF0EA', '#D8E0D0', '#8A9065', '#1E2820'],
    isDark: false,
  },
  {
    id: 'warm-slate',
    name: '▣ Warm Slate',
    desc: 'Gris editorial · Topo · Platino cálido',
    colors: { bg: '#F2EFEC', bg2: '#E0DBD5', accent: '#8A807A', text: '#1E1A18', dark: '#0E0C0A', white: '#FFFFFF' },
    preview: ['#F2EFEC', '#E0DBD5', '#8A807A', '#1E1A18'],
    isDark: false,
  },
]

const PALETTE_MAP = Object.fromEntries(PALETTES.map(p => [p.id, p.colors]))

const STYLE_OPTIONS = PALETTES.map(p => ({
  value: p.id,
  label: `${p.name} — ${p.desc}${p.brand ? ' · TU MARCA' : ''}`,
}))

// ── Brand defaults JMC ───────────────────────────────────────────────────────
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

  const [step, setStep] = useState('template')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [brand, setBrand] = useState(JMC_DEFAULTS)
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [genStatus, setGenStatus] = useState('')
  const [generatedSlides, setGeneratedSlides] = useState([])

  const setBrandField = (k) => (e) => setBrand(s => ({ ...s, [k]: typeof e === 'string' ? e : e.target.value }))

  const activePalette = PALETTES.find(p => p.id === brand.style) || PALETTES[0]

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

  const generateCarousel = async () => {
    if (!selectedTemplate) return
    setGenerating(true)
    setGenProgress(0)
    const results = []
    const slides = selectedTemplate.data.slides
    const palette = PALETTE_MAP[brand.style] || PALETTE_MAP['luxury-nude']

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
    toast.success('¡10 slides generados!')
  }

  const openInEditor = () => {
    setSlides(generatedSlides.map(() => null))
    setFormat('portrait')
    setCurrentSlide(0)
    navigate('/', { state: { studioSlides: generatedSlides } })
  }

  return (
    <div className="min-h-screen" style={{ background: step === 'preview' ? '#F7F3EE' : undefined }}
      className={cn('min-h-screen', activePalette.isDark && step !== 'template' ? 'bg-[#050B14]' : 'bg-gradient-to-b from-[#F7F3EE] to-white dark:from-slate-900 dark:to-slate-800')}>

      {/* ── Hero ── */}
      <div className={cn(
        'relative overflow-hidden border-b',
        activePalette.isDark && step !== 'template'
          ? 'border-[#C4AA80]/20 bg-[#0C2530]'
          : 'border-[#E8D5BE] dark:border-slate-700'
      )}>
        {/* Decorative orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: activePalette.colors.accent }} />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-2xl opacity-10"
            style={{ background: activePalette.colors.accent }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center gap-10">
          {/* Logo JMC */}
          <div className="shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-2xl border-2"
              style={{ borderColor: activePalette.colors.accent + '40' }}>
              <img
                src={activePalette.isDark && step !== 'template'
                  ? '/Social-canvas/logo-jmc-dark.png'
                  : '/Social-canvas/logo-jmc-light.png'}
                alt="Dr. Colmenarez"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text */}
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-4"
              style={{
                background: activePalette.colors.accent + '20',
                border: `1px solid ${activePalette.colors.accent}40`,
                color: activePalette.isDark ? activePalette.colors.accent : '#8C6B4A',
              }}>
              <Sparkles className="w-3.5 h-3.5" />
              Creative Studio · IA Premium
            </div>
            <h1 className="text-4xl md:text-5xl font-light leading-tight mb-3"
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                color: activePalette.isDark && step !== 'template' ? activePalette.colors.white : '#2A2520',
              }}>
              Contenido que convierte.<br />
              <em style={{ color: activePalette.colors.accent }}>Diseñado para viralizar.</em>
            </h1>
            <p className="text-base leading-relaxed max-w-xl"
              style={{ color: activePalette.isDark && step !== 'template' ? activePalette.colors.accent + 'CC' : '#7A746E' }}>
              Templates de nivel internacional para medicina estética. Genera carruseles premium con IA en minutos.
            </p>
            <div className="flex items-center gap-6 mt-5 text-sm" style={{ color: activePalette.colors.accent }}>
              {[{ icon: Zap, t: 'Generación instantánea' }, { icon: Star, t: 'Nivel editorial' }, { icon: LayoutGrid, t: '10 slides listos' }].map(({ icon: I, t: tx }) => (
                <div key={tx} className="flex items-center gap-1.5"><I className="w-4 h-4" /><span style={{ color: activePalette.isDark && step !== 'template' ? activePalette.colors.text : '#7A746E' }}>{tx}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[{ key: 'template', label: 'Template' }, { key: 'brand', label: 'Marca' }, { key: 'generate', label: 'Generar' }, { key: 'preview', label: 'Preview' }].map((s, i) => {
            const idx = STEPS.indexOf(step); const sIdx = STEPS.indexOf(s.key)
            const done = sIdx < idx; const active = sIdx === idx
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <div className="w-10 h-px" style={{ background: done ? activePalette.colors.accent : '#e2e8f0' }} />}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: active ? activePalette.colors.dark : done ? activePalette.colors.accent + '25' : undefined,
                    color: active ? activePalette.colors.white : done ? activePalette.colors.accent : '#94a3b8',
                    border: active ? 'none' : `1px solid ${done ? activePalette.colors.accent + '40' : '#e2e8f0'}`,
                  }}>
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                  {s.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── STEP 1: Template ── */}
        {step === 'template' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#2A2520] dark:text-white mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Elige tu template</h2>
              <p className="text-[#7A746E] dark:text-slate-400 text-sm">Cada template incluye copy experto, dirección de arte y prompts IA optimizados</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {TEMPLATES.map((t) => (
                <button key={t.id} disabled={t.comingSoon}
                  onClick={() => { setSelectedTemplate(t); setStep('brand') }}
                  className={cn(
                    'relative text-left p-6 rounded-2xl border-2 transition-all group overflow-hidden',
                    t.comingSoon ? 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed' :
                      selectedTemplate?.id === t.id ? 'border-[#C4A882] shadow-lg' : 'border-slate-200 dark:border-slate-700 hover:border-[#C4A882]/50 hover:shadow-md'
                  )}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15 -translate-y-1/2 translate-x-1/2" style={{ background: t.color }} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl" style={{ color: t.color, fontFamily: 'Cormorant Garamond, serif' }}>{t.emoji}</span>
                      {t.comingSoon
                        ? <span className="text-[10px] uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">Próximamente</span>
                        : <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium" style={{ background: t.color + '20', color: t.color }}>{t.category}</span>}
                    </div>
                    <h3 className="font-semibold text-[#2A2520] dark:text-white text-lg mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{t.title}</h3>
                    <p className="text-xs text-[#7A746E] dark:text-slate-400">{t.subtitle}</p>
                    {!t.comingSoon && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs font-medium" style={{ color: t.color }}>{t.slides} slides</span>
                        {t.tags?.map(tag => <span key={tag} className="text-[10px] text-slate-400 uppercase tracking-wide">· {tag}</span>)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Brand ── */}
        {step === 'brand' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: activePalette.isDark ? activePalette.colors.white : '#2A2520' }}>
                Personaliza tu marca
              </h2>
              <p style={{ color: activePalette.isDark ? activePalette.colors.accent + 'AA' : '#7A746E' }} className="text-sm">El carrusel se genera con tu identidad profesional</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: form */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ borderColor: activePalette.colors.accent + '30', background: activePalette.isDark ? activePalette.colors.bg2 : '#FDFAF7' }}>
                  <Input label="Nombre del médico / clínica" placeholder="Dr. José Colmenarez" value={brand.doctor} onChange={setBrandField('doctor')} />
                </div>
                <div className="p-4 rounded-xl border" style={{ borderColor: activePalette.colors.accent + '30', background: activePalette.isDark ? activePalette.colors.bg2 : '#FDFAF7' }}>
                  <Input label="Instagram handle" placeholder="@drcolmenarez" value={brand.handle} onChange={setBrandField('handle')} />
                  <div className="mt-3">
                    <Input label="WhatsApp" placeholder="+58 414 000 0000" value={brand.whatsapp} onChange={setBrandField('whatsapp')} />
                  </div>
                </div>
                <div className="p-4 rounded-xl border" style={{ borderColor: activePalette.colors.accent + '30', background: activePalette.isDark ? activePalette.colors.bg2 : '#FDFAF7' }}>
                  <Input label="Especialidad / Tagline" placeholder="Especialista en Medicina Estética" value={brand.specialty} onChange={setBrandField('specialty')} />
                </div>
              </div>

              {/* Right: palette selector */}
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: activePalette.colors.accent }}>Paleta de colores</p>
                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-1">
                  {PALETTES.map((p) => (
                    <button key={p.id} onClick={() => setBrand(s => ({ ...s, style: p.id }))}
                      className={cn('flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left w-full', brand.style === p.id ? 'border-[#C4AA80] shadow-md' : 'border-transparent hover:border-[#C4AA80]/30')}
                      style={{ background: p.colors.bg }}>
                      {/* Color swatches */}
                      <div className="flex gap-1 shrink-0">
                        {p.preview.map((c, i) => (
                          <div key={i} className="w-5 h-8 rounded-md border border-black/10 shadow-sm" style={{ background: c }} />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold truncate" style={{ color: p.colors.text === p.colors.white ? p.colors.accent : p.colors.text }}>
                            {p.name}
                          </p>
                          {p.brand && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0"
                              style={{ background: p.colors.accent + '30', color: p.colors.accent }}>
                              TU MARCA
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] truncate" style={{ color: p.isDark ? p.colors.accent + '80' : '#94a3b8' }}>{p.desc}</p>
                      </div>
                      {brand.style === p.id && <CheckCircle className="w-4 h-4 shrink-0" style={{ color: p.colors.accent }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Logo preview */}
            {activePalette.logo && (
              <div className="p-5 rounded-2xl border flex items-center gap-5"
                style={{ borderColor: activePalette.colors.accent + '30', background: activePalette.isDark ? activePalette.colors.bg : '#FDFAF7' }}>
                <img src={activePalette.isDark ? activePalette.logo : activePalette.logoLight || activePalette.logo}
                  alt="Logo" className="h-16 w-16 object-contain rounded-xl" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: activePalette.isDark ? activePalette.colors.white : '#2A2520', fontFamily: 'Cormorant Garamond, serif' }}>
                    {brand.doctor || 'Dr. José Colmenarez'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: activePalette.colors.accent }}>{brand.specialty}</p>
                  <p className="text-xs mt-1" style={{ color: activePalette.isDark ? activePalette.colors.accent + '80' : '#94a3b8' }}>
                    {brand.handle} {brand.whatsapp && `· ${brand.whatsapp}`}
                  </p>
                </div>
                <div className="ml-auto">
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: activePalette.colors.accent + '60' }}>Logo aplicado</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setStep('template')}>← Volver</Button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{ background: activePalette.colors.dark, color: activePalette.colors.white }}
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
              <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: activePalette.isDark ? activePalette.colors.white : '#2A2520' }}>
                Todo listo para generar
              </h2>
              <p className="text-sm" style={{ color: activePalette.isDark ? activePalette.colors.accent + 'AA' : '#7A746E' }}>
                10 slides · Imágenes IA · Copy experto · Tu marca aplicada
              </p>
            </div>

            {/* Summary */}
            <div className="p-6 rounded-2xl border space-y-3 text-left"
              style={{ borderColor: activePalette.colors.accent + '30', background: activePalette.isDark ? activePalette.colors.bg2 : '#FDFAF7' }}>
              {[
                { k: 'Template', v: selectedTemplate?.title },
                { k: 'Médico', v: brand.doctor || '—' },
                { k: 'Instagram', v: brand.handle || '—' },
                { k: 'Paleta', v: activePalette.name },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: activePalette.colors.accent + '20' }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: activePalette.colors.accent + '80' }}>{k}</span>
                  <span className="text-sm font-medium" style={{ color: activePalette.isDark ? activePalette.colors.white : '#2A2520' }}>{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2">
                <span className="text-xs uppercase tracking-widest" style={{ color: activePalette.colors.accent + '80' }}>Colores</span>
                <div className="flex gap-1">
                  {activePalette.preview.map((c, i) => <div key={i} className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ background: c }} />)}
                </div>
              </div>
            </div>

            {generating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: activePalette.colors.accent }} />
                  <span className="text-sm" style={{ color: activePalette.isDark ? activePalette.colors.text : '#2A2520' }}>{genStatus}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: activePalette.colors.accent + '30' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${genProgress}%`, background: activePalette.colors.accent }} />
                </div>
                <p className="text-xs" style={{ color: activePalette.colors.accent + '80' }}>{genProgress}% completado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button onClick={generateCarousel}
                  className="w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${activePalette.colors.dark} 0%, ${activePalette.colors.bg2} 50%, ${activePalette.colors.accent} 100%)`, color: activePalette.colors.white }}>
                  <Sparkles className="w-5 h-5" />
                  Generar carrusel premium
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
                style={{ background: activePalette.colors.accent + '20', border: `1px solid ${activePalette.colors.accent}40`, color: activePalette.isDark ? activePalette.colors.accent : '#6B4A2A' }}>
                <CheckCircle className="w-3.5 h-3.5" />
                10 slides generados exitosamente
              </div>
              <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: activePalette.isDark ? activePalette.colors.white : '#2A2520' }}>
                Tu carrusel premium está listo
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={openInEditor}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium shadow-lg transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${activePalette.colors.dark}, ${activePalette.colors.accent})`, color: activePalette.colors.white }}>
                <Edit3 className="w-4 h-4" /> Abrir en editor
              </button>
              <Button variant="secondary" className="gap-2" onClick={() => { setStep('template'); setGeneratedSlides([]) }}>
                <Sparkles className="w-4 h-4" /> Nuevo carrusel
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {generatedSlides.map((slide, i) => (
                <SlidePreviewCard key={i} slide={slide} index={i} palette={activePalette} brandLogo={activePalette.logo} />
              ))}
            </div>

            <CopySheet slides={generatedSlides} brand={brand} palette={activePalette} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Slide Preview Card ────────────────────────────────────────────────────────
function SlidePreviewCard({ slide, index, palette, brandLogo }) {
  const pal = slide.palette || palette.colors
  const el = slide.elements || {}
  const isDark = slide.isDark ?? palette.isDark

  return (
    <div className="group relative rounded-xl overflow-hidden border hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
      style={{ background: slide.bgColor || pal.bg || '#F7F3EE', aspectRatio: '4/5', borderColor: pal.accent + '30' }}>
      <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: isDark ? 0.25 : 0.40 }} loading="lazy"
        onError={(e) => { e.target.style.opacity = 0 }} />
      <div className="absolute inset-0" style={{
        background: isDark
          ? `linear-gradient(to bottom, ${pal.bg}CC 0%, ${pal.bg}F0 100%)`
          : `linear-gradient(to bottom, ${pal.bg}99 0%, ${pal.bg}F0 55%)`,
      }} />

      <div className="relative h-full flex flex-col p-3">
        <div className="flex items-center justify-between">
          <span className="text-[8px] uppercase tracking-widest font-medium px-1.5 py-0.5 rounded"
            style={{ color: pal.accent, background: pal.accent + '20' }}>
            {el.label?.split('/')[0]?.trim() || `Slide ${index + 1}`}
          </span>
          <span className="text-[8px] font-mono" style={{ color: pal.accent + '80' }}>{String(index + 1).padStart(2, '0')}</span>
        </div>

        <div className="mt-auto">
          {(Array.isArray(el.headline) ? el.headline : [el.headline]).filter(Boolean).map((line, j) => (
            <p key={j} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '11px', color: isDark ? pal.white || '#F5F0E8' : pal.text, lineHeight: 1.2, fontWeight: 600 }}>
              {line}
            </p>
          ))}
          {el.accent && <p className="text-[7px] mt-1 uppercase tracking-wide" style={{ color: pal.accent }}>{typeof el.accent === 'string' ? el.accent.slice(0, 28) : ''}</p>}
        </div>

        {/* Accent line + logo */}
        <div className="flex items-end justify-between mt-2">
          <div className="w-6 h-px" style={{ background: pal.accent }} />
          {brandLogo && index === 9 && (
            <img src={brandLogo} alt="logo" className="h-5 w-5 object-contain opacity-80 rounded" />
          )}
        </div>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.45)' }}>
        <span className="text-white text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
          Vista previa
        </span>
      </div>
    </div>
  )
}

// ── Copy Sheet ────────────────────────────────────────────────────────────────
function CopySheet({ slides, brand, palette }) {
  const [open, setOpen] = useState(false)
  const pal = palette.colors

  const copyAll = () => {
    const text = slides.map((s, i) => {
      const el = s.elements
      const headline = Array.isArray(el.headline) ? el.headline.join(' ') : el.headline
      return `--- SLIDE ${i + 1}: ${el.label || ''} ---\n${headline}\n${el.accent || ''}\n${el.body || ''}`
    }).join('\n\n')
    navigator.clipboard.writeText(text)
    toast.success('Copy copiado ✓')
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: pal.accent + '30', background: palette.isDark ? pal.bg2 : '#FDFAF7' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        style={{ background: palette.isDark ? pal.bg : undefined }}>
        <div>
          <h3 className="font-semibold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: palette.isDark ? pal.white : '#2A2520' }}>
            Copy completo del carrusel
          </h3>
          <p className="text-xs mt-0.5" style={{ color: pal.accent + '80' }}>Texto personalizado con tu marca · Listo para publicar</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); copyAll() }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: pal.accent + '40', color: pal.accent, background: pal.accent + '10' }}>
            Copiar todo
          </button>
          <ChevronRight className={cn('w-4 h-4 transition-transform', open && 'rotate-90')} style={{ color: pal.accent }} />
        </div>
      </button>

      {open && (
        <div className="p-6 space-y-3 border-t" style={{ borderColor: pal.accent + '20' }}>
          {slides.map((s, i) => {
            const el = s.elements
            const headline = Array.isArray(el.headline) ? el.headline.join(' ') : el.headline
            return (
              <div key={i} className="p-4 rounded-xl border" style={{ borderColor: pal.accent + '20', background: palette.isDark ? pal.bg : '#F7F3EE' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: pal.accent, color: pal.dark }}>
                    {i + 1}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: pal.accent }}>{el.label}</span>
                </div>
                <p className="font-semibold text-sm mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: palette.isDark ? pal.white : '#2A2520' }}>{headline}</p>
                {el.accent && <p className="text-xs mb-1" style={{ color: pal.accent }}>{el.accent}</p>}
                {el.body && <p className="text-xs whitespace-pre-line" style={{ color: palette.isDark ? pal.text + 'CC' : '#7A746E' }}>{el.body}</p>}
                {el.quote && <p className="text-xs italic mt-1" style={{ color: pal.accent }}>"{el.quote}"</p>}
                {el.myths?.map((m, j) => (
                  <div key={j} className="mt-1 text-xs">
                    <p style={{ color: '#94a3b8', textDecoration: 'line-through' }}>{m.myth}</p>
                    <p style={{ color: palette.isDark ? pal.text : '#6A746E' }}>{m.truth}</p>
                  </div>
                ))}
              </div>
            )
          })}

          {/* Instagram caption */}
          <div className="p-5 rounded-2xl border" style={{ borderColor: pal.accent + '40', background: `linear-gradient(135deg, ${pal.bg} 0%, ${pal.bg2} 100%)` }}>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-3" style={{ color: pal.accent }}>
              Caption sugerido para Instagram
            </p>
            <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: palette.isDark ? pal.text : '#2A2520' }}>
              {`¿Cuántas de estas dudas tenías sobre el Botox? 👇

El 80% de mis pacientes llegan con estos mitos en la cabeza.

La realidad: el botox moderno bien aplicado es invisible. No congela. No deforma.

Solo... mejora.

Agenda tu valoración personalizada.
👉 ${brand.handle || '@drcolmenarez'} · WhatsApp en bio

#BotoxPremium #MedicinaEstética #${(brand.handle || '@drcolmenarez').replace('@', '')} #BotoxNatural #BotoxPreventivo`}
            </p>
            <button onClick={() => { navigator.clipboard.writeText(''); toast.success('Caption copiado ✓') }}
              className="mt-3 text-xs hover:underline" style={{ color: pal.accent }}>
              Copiar caption →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
