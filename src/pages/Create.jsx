import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, X, Globe, Video, FileText } from 'lucide-react'
import { generateSmartCarousel } from '../lib/smartGenerator'
import { generatePollinationsUrl } from '../lib/aiProviders'
import { extractFromUrl, extractFromYoutube, extractFromPdf } from '../lib/contentExtractor'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const PALETTES = [
  { id: 'dark',    label: 'Dark',    bg: '#0C1018', bg2: '#111827', accent: '#818CF8', text: '#F0F0FF' },
  { id: 'warm',    label: 'Warm',    bg: '#0D0A07', bg2: '#1A1410', accent: '#E8B87A', text: '#F5EEE0' },
  { id: 'light',   label: 'Light',   bg: '#F8F6F2', bg2: '#EFECE6', accent: '#C4A882', text: '#1A1814' },
  { id: 'green',   label: 'Nature',  bg: '#080F0A', bg2: '#0F1F12', accent: '#6EBF8B', text: '#E8F5EC' },
  { id: 'rose',    label: 'Rose',    bg: '#100A0C', bg2: '#1F1115', accent: '#D4869A', text: '#FAE8EC' },
]

const FORMATS = [
  { id: 'portrait',  label: '4:5',  note: 'Instagram post' },
  { id: 'story',     label: '9:16', note: 'Stories' },
  { id: 'square',    label: '1:1',  note: 'Feed cuadrado' },
]

export default function Create() {
  const navigate = useNavigate()
  const { setStudioSlides, setSlides, setFormat, setCurrentSlide } = useStore()

  const [prompt, setPrompt] = useState('')
  const [palette, setPalette] = useState('warm')
  const [format, setFormatChoice] = useState('portrait')
  const [showOptions, setShowOptions] = useState(false)
  const [inputMode, setInputMode] = useState('text') // text | url | youtube | pdf
  const [url, setUrl] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(null)

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [slides, setSlideResults] = useState([])

  const pdfRef = useRef(null)
  const selectedPalette = PALETTES.find(p => p.id === palette) || PALETTES[1]

  const extractContent = async () => {
    setExtracting(true)
    try {
      let result
      if (inputMode === 'url') result = await extractFromUrl(url)
      else if (inputMode === 'youtube') result = await extractFromYoutube(url)
      else if (inputMode === 'pdf') result = await extractFromPdf(pdfFile)
      setExtracted(result)
      toast.success('Contenido extraído ✓')
    } catch (e) { toast.error(e.message) }
    finally { setExtracting(false) }
  }

  const generate = async () => {
    let topic = prompt.trim()

    // If using URL/PDF/YouTube mode
    if (inputMode !== 'text') {
      if (!extracted) { await extractContent(); return }
      topic = extracted.title || extracted.fileName || url || 'Contenido importado'
    }

    if (!topic) { toast.error('Escribe el tema de tu carrusel'); return }

    setLoading(true)
    setSlideResults([])
    setProgress(0)

    try {
      setStatus('Generando estructura del carrusel...')
      await new Promise(r => setTimeout(r, 300))

      const { slides: raw, meta } = generateSmartCarousel({ topic, brand: {}, tone: 'educational' })

      setStatus('Generando imágenes...')
      const pal = selectedPalette
      const results = []

      for (let i = 0; i < raw.length; i++) {
        const s = raw[i]
        setProgress(Math.round((i / raw.length) * 100))
        setStatus(`Imagen ${i + 1} de ${raw.length}`)
        const imageUrl = generatePollinationsUrl(
          s.imagePrompt || topic, s.imageStyle || 'photorealistic', 820, 1024, 'flux'
        )
        results.push({
          ...s,
          imageUrl,
          palette: pal,
          isDark: ['dark', 'warm', 'green', 'rose'].includes(palette),
        })
        await new Promise(r => setTimeout(r, 80))
      }

      setProgress(100)
      setStatus('¡Listo!')
      setSlideResults(results)
      toast.success(`${results.length} slides generados`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const openInEditor = () => {
    setStudioSlides(slides)
    setSlides(slides.map(() => null))
    setFormat(format)
    setCurrentSlide(0)
    navigate('/editor')
  }

  const reset = () => { setSlideResults([]); setProgress(0); setStatus('') }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <div className="pill" style={{ marginBottom: 14 }}>
          <Sparkles size={11} /> Generador de Carruseles IA
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6 }}>
          Crear nuevo carrusel
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          Describe tu contenido en lenguaje natural. La IA genera los 10 slides completos.
        </p>
      </div>

      {/* ── Input mode tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'text',    label: '✏️ Texto' },
          { id: 'url',     label: '🌐 URL web' },
          { id: 'youtube', label: '🎬 YouTube' },
          { id: 'pdf',     label: '📄 PDF' },
        ].map(m => (
          <button key={m.id} onClick={() => { setInputMode(m.id); setExtracted(null) }}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: `1px solid ${inputMode === m.id ? 'var(--accent-b)' : 'var(--border)'}`,
              background: inputMode === m.id ? 'var(--accent-d)' : 'transparent',
              color: inputMode === m.id ? 'var(--accent)' : 'var(--text-3)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Main prompt / input ── */}
      <div style={{ marginBottom: 16 }}>
        {inputMode === 'text' && (
          <textarea className="input" rows={4}
            placeholder="Ej: Carrusel sobre los beneficios del colágeno para la piel, con tono aspiracional para mujeres de 30-45 años..."
            value={prompt} onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) generate() }}
            style={{ fontSize: 15, lineHeight: 1.6 }}
          />
        )}

        {(inputMode === 'url' || inputMode === 'youtube') && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" type="url"
              placeholder={inputMode === 'url' ? 'https://ejemplo.com/articulo' : 'https://youtube.com/watch?v=...'}
              value={url} onChange={e => { setUrl(e.target.value); setExtracted(null) }}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={extractContent} disabled={extracting || !url}
              style={{ flexShrink: 0 }}>
              {extracting ? <span className="spinner spinner-sm" /> : 'Leer'}
            </button>
          </div>
        )}

        {inputMode === 'pdf' && (
          <div>
            <div onClick={() => pdfRef.current?.click()}
              style={{ border: `1.5px dashed ${pdfFile ? 'var(--accent-b)' : 'var(--border)'}`, borderRadius: 10, padding: '20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: pdfFile ? 'var(--accent-d)' : 'transparent', transition: 'all 0.15s' }}>
              <FileText size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: pdfFile ? 'var(--accent)' : 'var(--text-3)' }}>
                {pdfFile ? pdfFile.name : 'Haz clic para seleccionar un PDF'}
              </span>
              {pdfFile && <button onClick={e => { e.stopPropagation(); setPdfFile(null); setExtracted(null) }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><X size={16} /></button>}
            </div>
            <input ref={pdfRef} type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={e => { setPdfFile(e.target.files[0]); setExtracted(null) }} />
            {pdfFile && !extracted && (
              <button className="btn btn-primary" onClick={extractContent} disabled={extracting} style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                {extracting ? <><span className="spinner spinner-sm" /> Procesando...</> : 'Procesar PDF'}
              </button>
            )}
          </div>
        )}

        {extracted && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: 'var(--accent-d)', border: '1px solid var(--accent-b)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <span style={{ color: 'var(--accent)' }}>✓</span>
            <span style={{ color: 'var(--text-2)' }}>
              {extracted.title || extracted.fileName || 'Contenido extraído'} — la IA usará este contenido como base
            </span>
          </div>
        )}
      </div>

      {/* ── Options (collapsible) ── */}
      <div style={{ marginBottom: 20, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <button onClick={() => setShowOptions(v => !v)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' }}>
          <span>Opciones de diseño</span>
          {showOptions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showOptions && (
          <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 16 }}>

            {/* Palette */}
            <div style={{ marginBottom: 16 }}>
              <label className="label">Paleta de colores</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PALETTES.map(p => (
                  <button key={p.id} onClick={() => setPalette(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
                      borderRadius: 8, border: `1.5px solid ${palette === p.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: p.bg, cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.accent }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: p.text }}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="label">Formato</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setFormatChoice(f.id)}
                    style={{
                      padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      border: `1.5px solid ${format === f.id ? 'var(--accent-b)' : 'var(--border)'}`,
                      background: format === f.id ? 'var(--accent-d)' : 'transparent',
                      color: format === f.id ? 'var(--accent)' : 'var(--text-2)',
                      transition: 'all 0.15s',
                    }}>
                    <strong>{f.label}</strong>
                    <span style={{ color: 'var(--text-3)', marginLeft: 6, fontSize: 11 }}>{f.note}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Generate button ── */}
      {slides.length === 0 && (
        <button className="btn btn-lg" onClick={generate} disabled={loading}
          style={{ width: '100%', justifyContent: 'center', borderRadius: 12 }}>
          {loading
            ? <><span className="spinner spinner-sm" /> {status || 'Generando...'}</>
            : <><Sparkles size={18} /> Generar carrusel</>}
        </button>
      )}

      {/* ── Progress bar ── */}
      {loading && (
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 99, transition: 'width 0.3s', width: `${progress}%` }} />
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{progress}% · {status}</p>
        </div>
      )}

      {/* ── Results ── */}
      {slides.length > 0 && (
        <div style={{ marginTop: 32 }}>
          {/* Action bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Tu carrusel está listo</h2>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{slides.length} slides generados · Haz clic en cualquiera para ampliarlo</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={reset}>Generar otro</button>
              <button className="btn btn-primary" onClick={openInEditor}>
                Editar slides <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Slides grid */}
          <SlideGrid slides={slides} palette={selectedPalette} onOpen={(idx) => document.getElementById(`modal-${idx}`)?.showModal()} />
        </div>
      )}
    </div>
  )
}

/* ── Slide grid ──────────────────────────────────────── */
function SlideGrid({ slides, palette }) {
  const [modalIdx, setModalIdx] = useState(null)

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {slides.map((s, i) => (
          <SlideCard key={i} slide={s} index={i} palette={palette} onClick={() => setModalIdx(i)} />
        ))}
      </div>

      {/* Modal */}
      {modalIdx !== null && (
        <SlideModal
          slides={slides} idx={modalIdx}
          setIdx={setModalIdx} palette={palette}
          onClose={() => setModalIdx(null)}
        />
      )}
    </>
  )
}

function SlideCard({ slide, index, palette, onClick }) {
  const pal = slide.palette || palette
  const el = slide.elements || {}
  const isDark = slide.isDark ?? true
  const headline = Array.isArray(el.headline) ? el.headline : [el.headline].filter(Boolean)

  return (
    <div onClick={onClick}
      style={{
        aspectRatio: '4/5', borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        border: '1px solid var(--border)', position: 'relative',
        background: pal.bg || '#0D0A07',
        transition: 'transform 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.5)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>

      {/* Background image */}
      <img src={slide.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: isDark ? 0.28 : 0.38 }} onError={e => { e.target.style.opacity = 0 }} loading="lazy" />
      <div style={{ position: 'absolute', inset: 0, background: isDark ? `linear-gradient(160deg, ${pal.bg}90, ${pal.bg}F0)` : `linear-gradient(160deg, ${pal.bg}80, ${pal.bg}F5 60%)` }} />

      {/* Content */}
      <div style={{ position: 'relative', height: '100%', padding: 14, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.15em', color: pal.accent, background: `${pal.accent}15`, padding: '3px 8px', borderRadius: 99, alignSelf: 'flex-start', border: `0.5px solid ${pal.accent}25` }}>
          {typeof el.label === 'string' ? el.label.split('/')[0].trim().slice(0, 14) : `${index + 1}`}
        </span>
        <div style={{ marginTop: 'auto' }}>
          {headline.slice(0, 3).map((l, j) => (
            <p key={j} style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: pal.text || '#F5EEE0', lineHeight: 1.15 }}>{l}</p>
          ))}
          <div style={{ width: 18, height: 1.5, background: pal.accent, marginTop: 10, opacity: 0.7 }} />
        </div>
      </div>

      {/* Hover overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'white', padding: '5px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', opacity: 0, transition: 'opacity 0.18s' }}
          ref={el => { if (el) { el.parentElement.onmouseenter = () => el.style.opacity = 1; el.parentElement.onmouseleave = () => el.style.opacity = 0 } }}>
          Ver slide
        </span>
      </div>
    </div>
  )
}

/* ── Slide modal ─────────────────────────────────────── */
function SlideModal({ slides, idx, setIdx, palette, onClose }) {
  const slide = slides[idx]
  if (!slide) return null
  const pal = slide.palette || palette
  const el = slide.elements || {}
  const isDark = slide.isDark ?? true
  const headline = Array.isArray(el.headline) ? el.headline : [el.headline].filter(Boolean)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 340 }} onClick={e => e.stopPropagation()}>

        {/* Arrows */}
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)}
            style={{ position: 'absolute', left: -48, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ‹
          </button>
        )}
        {idx < slides.length - 1 && (
          <button onClick={() => setIdx(i => i + 1)}
            style={{ position: 'absolute', right: -48, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ›
          </button>
        )}

        {/* Slide */}
        <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/5', position: 'relative', background: pal.bg || '#0D0A07', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
          <img src={slide.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: isDark ? 0.32 : 0.42 }} onError={e => { e.target.style.opacity = 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: isDark ? `linear-gradient(160deg, ${pal.bg}88, ${pal.bg}F5)` : `linear-gradient(160deg, ${pal.bg}70, ${pal.bg}F5 65%)` }} />

          <div style={{ position: 'relative', height: '100%', padding: 28, display: 'flex', flexDirection: 'column' }}>
            {el.label && (
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: pal.accent, background: `${pal.accent}15`, padding: '4px 10px', borderRadius: 99, alignSelf: 'flex-start', border: `0.5px solid ${pal.accent}30`, marginBottom: 16 }}>
                {typeof el.label === 'string' ? el.label.split('/')[0].trim() : ''}
              </span>
            )}
            <div style={{ width: 24, height: 1.5, background: pal.accent, opacity: 0.6, marginBottom: 16 }} />

            <div>
              {headline.map((l, j) => (
                <p key={j} style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: pal.text || '#F5EEE0', lineHeight: 1.15 }}>{l}</p>
              ))}
            </div>

            {el.accent && typeof el.accent === 'string' && (
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontStyle: 'italic', color: pal.accent, marginTop: 10, opacity: 0.85 }}>{el.accent.slice(0, 70)}</p>
            )}

            {el.body && typeof el.body === 'string' && (
              <p style={{ fontSize: 13, color: (pal.text || '#F5EEE0') + 'BB', lineHeight: 1.7, marginTop: 14, fontWeight: 300 }}>
                {el.body.slice(0, 180)}{el.body.length > 180 ? '…' : ''}
              </p>
            )}

            {Array.isArray(el.bullets) && el.bullets.length > 0 && (
              <ul style={{ marginTop: 14, space: 8 }}>
                {el.bullets.slice(0, 4).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: (pal.text || '#F5EEE0') + 'AA', marginBottom: 6 }}>
                    <span style={{ color: pal.accent, flexShrink: 0 }}>·</span>{String(b).slice(0, 55)}
                  </li>
                ))}
              </ul>
            )}

            {el.quote && typeof el.quote === 'string' && (
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontStyle: 'italic', color: pal.accent, marginTop: 'auto', paddingTop: 16 }}>
                "{el.quote.slice(0, 90)}"
              </p>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `0.5px solid ${pal.accent}25`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 1, background: pal.accent, opacity: 0.5 }} />
              {el.handle && <span style={{ fontSize: 10, color: pal.accent, letterSpacing: '0.08em' }}>{el.handle}</span>}
            </div>
          </div>
        </div>

        {/* Dots + close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 4px' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 99, background: i === idx ? pal.accent : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
            ))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500 }}>
            Cerrar ✕
          </button>
        </div>
      </div>
    </div>
  )
}
