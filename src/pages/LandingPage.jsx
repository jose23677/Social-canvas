import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Layers, Grid3x3, Video, Image, Zap, Star, CheckCircle } from 'lucide-react'

const SLIDES_DEMO = [
  { label: 'MEDICINA ESTÉTICA', title: ['Tu mejor versión', 'comienza aquí'], accent: 'Tratamientos de precisión', bg: '#0C1A28', img: 'https://image.pollinations.ai/prompt/elegant%20woman%20glowing%20skin%20champagne%20light%20editorial%20luxury?model=flux&width=400&height=500&seed=42&nologo=true' },
  { label: '01 / BENEFICIOS', title: ['6 razones para', 'elegirlo'], accent: 'Ciencia y precisión', bg: '#1A0C28', img: 'https://image.pollinations.ai/prompt/luxury%20medical%20clinic%20golden%20light%20premium%20minimal?model=flux&width=400&height=500&seed=43&nologo=true' },
  { label: '02 / RESULTADOS', title: ['Resultados', 'en 14 días'], accent: 'Timeline exacto', bg: '#0C2818', img: 'https://image.pollinations.ai/prompt/beautiful%20woman%20natural%20radiant%20skin%20champagne%20editorial?model=flux&width=400&height=500&seed=44&nologo=true' },
]

const FEATURES = [
  { icon: Sparkles, title: 'IA que diseña sola', desc: 'Escribe un prompt. La IA crea slides, copies, hooks y CTA de forma automática con calidad de agencia.' },
  { icon: Image, title: 'Imágenes hiperrealistas', desc: 'Genera imágenes cinematográficas con Flux AI. Calidad editorial, nivel campaña internacional.' },
  { icon: Grid3x3, title: 'Feed simulator', desc: 'Previsualiza cómo se verá tu feed de Instagram. Arrastra, reordena y exporta listo para publicar.' },
  { icon: Layers, title: 'Editor visual', desc: 'Edita cada slide con el canvas. Texto, colores, imágenes, capas. Control total sobre el diseño.' },
  { icon: Video, title: 'AI Reels', desc: 'Genera storyboards y guiones virales para tus Reels. De un prompt a un concepto completo.' },
  { icon: Zap, title: 'Instantáneo', desc: 'Sin API keys, sin registro de terceros. Genera tu primer carrusel en menos de 30 segundos.' },
]

const NICHES = ['Medicina Estética', 'Skincare', 'Fitness', 'Real Estate', 'Moda', 'Branding Personal', 'Nutrición', 'Coaching']

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)', background: 'rgba(9,9,11,0.8)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Social<span style={{ color: 'var(--accent)' }}>Canvas</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }} onClick={() => navigate('/gallery')}>Galería</button>
            <button className="btn-primary" style={{ padding: '7px 16px', fontSize: 13 }} onClick={() => navigate('/studio')}>
              Crear ahora <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="grid-bg" style={{ padding: '100px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '20%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(196,168,130,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'var(--accent-glow)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 99, marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-slow 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-h)', letterSpacing: '0.05em' }}>IA GENERATIVA · CONTENIDO PREMIUM</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-100" style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.03em', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Crea carruseles<br />
            <span className="grad-accent">virales con IA</span><br />
            en segundos
          </h1>

          <p className="animate-fade-up delay-200" style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Genera carruseles, imágenes y contenido editorial de calidad de agencia creativa.
            Sin diseñador. Sin agencia. Solo un prompt.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '13px 28px', fontSize: 15, borderRadius: 12 }} onClick={() => navigate('/studio')}>
              <Sparkles size={18} /> Crear mi carrusel gratis
            </button>
            <button className="btn-ghost" style={{ padding: '13px 28px', fontSize: 15, borderRadius: 12 }} onClick={() => navigate('/studio?tab=templates')}>
              Ver plantillas <ArrowRight size={16} />
            </button>
          </div>

          {/* Social proof */}
          <div className="animate-fade-up delay-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 40, color: 'var(--text-3)', fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={14} style={{ color: 'var(--accent)' }} /> Sin API key</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={14} style={{ color: 'var(--accent)' }} /> Gratis para empezar</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={14} style={{ color: 'var(--accent)' }} /> Listo en 30 segundos</span>
          </div>
        </div>
      </section>

      {/* ── Carousel Demo ── */}
      <section style={{ padding: '0 24px 100px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Preview title */}
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 32 }}>
            Resultado real generado por la IA
          </p>

          {/* Carousel mockup */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', overflowX: 'auto', paddingBottom: 16 }}>
            {SLIDES_DEMO.map((s, i) => (
              <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s`, flexShrink: 0, width: 220, aspectRatio: '4/5', borderRadius: 20, overflow: 'hidden', position: 'relative', border: '1px solid var(--border)', transform: i === 1 ? 'scale(1.05)' : 'scale(0.95)', transition: 'transform 0.3s' }}>
                <img src={s.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} onError={e => { e.target.style.opacity = 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${s.bg}99, ${s.bg}F5)` }} />
                <div style={{ position: 'relative', height: '100%', padding: 20, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--gold)', background: 'rgba(196,168,130,0.15)', padding: '3px 8px', borderRadius: 99, alignSelf: 'flex-start', border: '0.5px solid rgba(196,168,130,0.3)' }}>
                    {s.label}
                  </span>
                  <div style={{ marginTop: 'auto' }}>
                    {s.title.map((l, j) => <p key={j} style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.15 }}>{l}</p>)}
                    <p style={{ fontSize: 10, color: 'var(--gold)', marginTop: 8, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>{s.accent}</p>
                    <div style={{ width: 24, height: 1, background: 'var(--gold)', marginTop: 12 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 12 }}>Funcionalidades</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Una agencia creativa<br /><span className="grad-accent">dentro de tu navegador</span>
            </h2>
            <p style={{ color: 'var(--text-2)', maxWidth: 480, margin: '0 auto' }}>
              Todo lo que necesitas para crear contenido premium para Instagram, sin diseñador ni agencia.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card animate-fade-up" style={{ padding: 28, animationDelay: `${i * 0.07}s` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-glow)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <f.icon size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Niches ── */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p className="label" style={{ marginBottom: 24 }}>Funciona para cualquier nicho</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {NICHES.map((n, i) => (
              <span key={i} className="tag" style={{ padding: '8px 18px', fontSize: 13, borderRadius: 99 }}>{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p className="label" style={{ marginBottom: 12 }}>Cómo funciona</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              3 pasos para contenido premium
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { n: '01', title: 'Escribe tu prompt', desc: 'Describe el contenido que quieres crear. Puede ser un tema médico, un producto, una historia. La IA entiende cualquier idea.' },
              { n: '02', title: 'La IA diseña todo', desc: 'En segundos, la IA genera 10 slides completos: texto, diseño, imágenes hiperrealistas, hooks virales y CTAs de alta conversión.' },
              { n: '03', title: 'Edita y exporta', desc: 'Ajusta lo que necesites en el editor visual. Luego exporta en alta resolución, listo para publicar en Instagram.' },
            ].map((s, i) => (
              <div key={i} className="card animate-fade-up" style={{ padding: '28px 32px', display: 'flex', gap: 28, alignItems: 'flex-start', animationDelay: `${i * 0.1}s` }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 48, fontWeight: 700, color: 'var(--border-h)', lineHeight: 1, flexShrink: 0, marginTop: -4 }}>{s.n}</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid var(--border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 100%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 20px 60px rgba(99,102,241,0.4)' }}>
            <Sparkles size={28} color="white" />
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Empieza a crear<br /><span className="grad-accent">ahora mismo</span>
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
            Sin tarjeta de crédito. Sin API keys. Sin configuración.<br />
            Solo escribe tu idea y la IA hace el resto.
          </p>
          <button className="btn-primary" style={{ padding: '15px 36px', fontSize: 16, borderRadius: 14 }} onClick={() => navigate('/studio')}>
            <Sparkles size={20} /> Crear mi primer carrusel
          </button>
          <p style={{ marginTop: 20, color: 'var(--text-3)', fontSize: 13 }}>Gratis para siempre en el plan básico</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="white" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>SocialCanvas</span>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Hecho con IA para creadores de contenido premium</p>
        </div>
      </footer>
    </div>
  )
}
