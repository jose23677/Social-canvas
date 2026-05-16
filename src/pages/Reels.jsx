import { useState, useRef } from 'react'
import { Sparkles, RefreshCw, Upload, X, Video } from 'lucide-react'
import { generatePollinationsUrl } from '../lib/aiProviders'
import toast from 'react-hot-toast'

const MOODS = [
  { id: 'cinematic', label: '🎬 Cinematográfico', suffix: 'cinematic camera movement, dramatic lighting, film quality' },
  { id: 'dynamic',   label: '⚡ Dinámico',        suffix: 'fast dynamic movement, energetic, vibrant colors' },
  { id: 'smooth',    label: '🌊 Suave',            suffix: 'smooth slow motion, fluid, calm atmosphere' },
  { id: 'dramatic',  label: '🌑 Dramático',        suffix: 'dramatic, dark moody atmosphere, intense' },
]

const FRAMES = ['Apertura', 'Desarrollo', 'Clímax', 'Cierre']

export default function Reels() {
  const [prompt, setPrompt] = useState('')
  const [mood, setMood] = useState('cinematic')
  const [loading, setLoading] = useState(false)
  const [frames, setFrames] = useState([])
  const [refImg, setRefImg] = useState(null)
  const fileRef = useRef(null)

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Describe tu reel')
    setLoading(true); setFrames([])
    const m = MOODS.find(x => x.id === mood)
    const generated = FRAMES.map((label, i) => ({
      label,
      url: generatePollinationsUrl(`${prompt}, ${m.suffix}, ${label.toLowerCase()} shot, frame ${i+1} of 4`, 'cinematic', 768, 432, 'flux'),
    }))
    setFrames(generated)
    setLoading(false)
    toast.success('Storyboard generado ✓')
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6 }}>AI Reels</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Genera el storyboard visual de tu reel. 4 frames de referencia, instantáneo y gratis.</p>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>

        {/* Prompt */}
        <div style={{ marginBottom: 18 }}>
          <label className="label">Describe tu reel</label>
          <textarea className="input" rows={3} style={{ resize: 'none', fontSize: 15 }}
            placeholder="Ej: Mujer caminando por la ciudad al atardecer, colores cálidos, cámara lenta, estética premium..."
            value={prompt} onChange={e => setPrompt(e.target.value)} />
        </div>

        {/* Mood */}
        <div style={{ marginBottom: 18 }}>
          <label className="label">Estilo</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MOODS.map(m => (
              <button key={m.id} onClick={() => setMood(m.id)}
                style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${mood === m.id ? 'var(--accent-b)' : 'var(--border)'}`,
                  background: mood === m.id ? 'var(--accent-d)' : 'transparent',
                  color: mood === m.id ? 'var(--accent)' : 'var(--text-2)',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reference image */}
        <div style={{ marginBottom: 20 }}>
          <label className="label">Imagen de referencia (opcional)</label>
          <div onClick={() => fileRef.current?.click()}
            style={{
              border: `1.5px dashed ${refImg ? 'var(--accent-b)' : 'var(--border)'}`,
              borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', background: refImg ? 'var(--accent-d)' : 'transparent',
              transition: 'all 0.15s',
            }}>
            <Upload size={17} style={{ color: refImg ? 'var(--accent)' : 'var(--text-3)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: refImg ? 'var(--accent)' : 'var(--text-2)', flex: 1 }}>
              {refImg ? 'Imagen de referencia cargada' : 'Sube una imagen base (opcional)'}
            </span>
            {refImg && (
              <>
                <img src={refImg} alt="" style={{ width: 40, height: 28, borderRadius: 5, objectFit: 'cover' }} />
                <button onClick={e => { e.stopPropagation(); setRefImg(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontFamily: 'inherit' }}>
                  <X size={14} />
                </button>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setRefImg(ev.target.result); r.readAsDataURL(f) } }} />
        </div>

        <button className="btn btn-lg" onClick={generate} disabled={loading || !prompt.trim()}
          style={{ width: '100%', justifyContent: 'center', borderRadius: 10, fontSize: 15 }}>
          {loading ? <><span className="spinner spinner-sm" /> Generando storyboard...</> : <><Sparkles size={17} /> Generar storyboard gratis</>}
        </button>
      </div>

      {/* Storyboard result */}
      {frames.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Storyboard de tu reel</h3>
            <button onClick={generate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-h)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <RefreshCw size={13} /> Regenerar
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {frames.map((f, i) => (
              <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ aspectRatio: '16/9', background: 'var(--bg-2)', position: 'relative', overflow: 'hidden' }}>
                  <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.opacity = 0 }} loading="lazy" />
                </div>
                <div style={{ padding: '7px 10px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>
              <strong style={{ color: 'var(--text)' }}>Storyboard generado. </strong>
              Para el video MP4 real usa RunwayML o Higgsfield AI — ambos tienen plan gratuito. Este storyboard te sirve de referencia visual para el rodaje o para crear el reel en CapCut.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
