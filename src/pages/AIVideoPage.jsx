import { useState, useRef } from 'react'
import { Video, Wand2, Download, Upload, X, ChevronDown, ChevronUp, ImageIcon, Sparkles } from 'lucide-react'
import { generatePollinationsUrl } from '../lib/aiProviders'
import toast from 'react-hot-toast'

const MOODS = [
  { v: 'cinematic', label: '🎬 Cinematográfico' },
  { v: 'dynamic',   label: '⚡ Dinámico' },
  { v: 'smooth',    label: '🌊 Suave' },
  { v: 'dramatic',  label: '🌑 Dramático' },
]

const MOOD_SUFFIX = {
  cinematic: 'cinematic camera movement film look dramatic lighting',
  dynamic:   'fast dynamic movement energetic vibrant',
  smooth:    'smooth slow motion fluid movement calm',
  dramatic:  'dramatic atmosphere dark moody intense',
}

const STORYBOARD_LABELS = ['Apertura', 'Desarrollo', 'Clímax', 'Cierre']

export default function AIVideoPage() {
  const [prompt, setPrompt] = useState('')
  const [mood, setMood] = useState('cinematic')
  const [loading, setLoading] = useState(false)
  const [storyboard, setStoryboard] = useState([])
  const [refImage, setRefImage] = useState(null)
  const [showVideo, setShowVideo] = useState(false)
  const fileRef = useRef(null)

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Escribe qué reel quieres crear')
    setLoading(true)
    setStoryboard([])

    const frames = STORYBOARD_LABELS.map((l, i) => ({
      label: l,
      url: generatePollinationsUrl(
        `${prompt}, ${MOOD_SUFFIX[mood]}, ${l.toLowerCase()} shot, frame ${i + 1}`,
        'cinematic', 768, 432, 'flux'
      ),
    }))
    setStoryboard(frames)
    setLoading(false)
    toast.success('Storyboard generado ✓')
  }

  return (
    <div style={{ padding: '48px 32px', maxWidth: 800, margin: '0 auto' }}>

      <div style={{ marginBottom: 40 }}>
        <p className="label" style={{ marginBottom: 8 }}>Generador</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>AI Reels</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Genera storyboards y conceptos visuales para tus Reels de Instagram.</p>
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 24 }}>

        {/* Prompt */}
        <div style={{ marginBottom: 20 }}>
          <label className="label">Describe tu reel *</label>
          <textarea className="input" rows={3} style={{ resize: 'none' }}
            placeholder="Ej: Modelo de moda caminando por las calles de París al atardecer, colores vibrantes, cámara lenta..."
            value={prompt} onChange={e => setPrompt(e.target.value)} />
        </div>

        {/* Mood */}
        <div style={{ marginBottom: 20 }}>
          <label className="label">Estilo / Mood</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MOODS.map(m => (
              <button key={m.v} onClick={() => setMood(m.v)}
                className={`tag ${mood === m.v ? 'active' : ''}`}
                style={{ padding: '8px 16px', fontSize: 13 }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reference image */}
        <div style={{ marginBottom: 24 }}>
          <label className="label">Imagen de referencia (opcional)</label>
          <div onClick={() => fileRef.current?.click()}
            style={{ border: `1.5px dashed ${refImage ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.2s', background: refImage ? 'var(--accent-glow)' : 'var(--bg-card)' }}>
            {refImage ? (
              <>
                <img src={refImage} alt="" style={{ width: 56, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-h)' }}>Imagen de referencia cargada</p>
                  <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Se usará como primer frame del reel</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setRefImage(null) }} style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-2)' }}><X size={16} /></button>
              </>
            ) : (
              <>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={18} style={{ color: 'var(--text-3)' }} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Sube imagen de referencia (opcional)</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setRefImage(ev.target.result); r.readAsDataURL(f) } }} />
        </div>

        <button className="btn-primary" onClick={generate} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px 24px', fontSize: 15, borderRadius: 12 }}>
          {loading ? <><div className="spinner spinner-sm" /> Generando storyboard...</> : <><Sparkles size={18} /> Generar storyboard gratis</>}
        </button>
      </div>

      {/* Storyboard */}
      {storyboard.length > 0 && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Storyboard de tu reel</h3>
            <button onClick={generate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13 }}>
              <Wand2 size={14} /> Regenerar
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {storyboard.map((f, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ aspectRatio: '16/9', background: 'var(--bg-card)', position: 'relative', overflow: 'hidden' }}>
                  <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.opacity = 0 }} />
                </div>
                <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 16, textAlign: 'center' }}>
            El storyboard es gratis · Para generar el MP4 real usa RunwayML o Higgsfield AI
          </p>
        </div>
      )}

      {/* Video providers info */}
      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Generar video real (MP4)</h3>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>
          Para generar el video MP4 final, conecta con un proveedor de video IA. Obtén tu API key gratis en:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { name: 'RunwayML Gen-3', desc: 'Mejor calidad general', link: 'https://app.runwayml.com' },
            { name: 'Higgsfield AI', desc: 'Movimiento de personajes', link: 'https://app.higgsfield.ai' },
          ].map(p => (
            <a key={p.name} href={p.link} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.2s', background: 'var(--bg-card)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{p.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{p.desc}</p>
              <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 8 }}>Obtener API key →</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
