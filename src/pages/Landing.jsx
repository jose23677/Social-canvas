import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Zap, Layers, Grid3x3, Video, Check } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="4" fill="var(--accent)"/>
              <circle cx="20" cy="20" r="9" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="20" cy="20" r="15" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.3"/>
              <circle cx="20" cy="20" r="19.5" fill="none" stroke="var(--accent)" strokeWidth="0.6" opacity="0.15"/>
            </svg>
            AURE
          </div>
          <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }} onClick={() => navigate('/create')}>
            Empezar gratis <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 28px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(232,184,122,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        {/* Badge */}
        <div className="pill fade-up" style={{ marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          Generador de contenido con IA
        </div>

        {/* Headline */}
        <h1 className="fade-up d1" style={{ fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.04, marginBottom: 22 }}>
          Crea contenido premium<br />
          <span style={{ color: 'var(--accent)' }}>en segundos</span>
        </h1>

        <p className="fade-up d2" style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
          Escribe tu idea. La IA genera el carrusel completo — imágenes, copy, diseño. Sin agencia, sin diseñador.
        </p>

        {/* CTA */}
        <div className="fade-up d3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <button className="btn btn-lg" onClick={() => navigate('/create')}>
            <Sparkles size={18} /> Crear mi carrusel
          </button>
          <button className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: 15, borderRadius: 12 }} onClick={() => navigate('/gallery')}>
            Ver ejemplos <ArrowRight size={14} />
          </button>
        </div>

        {/* Trust */}
        <div className="fade-up d4" style={{ display: 'flex', gap: 24, color: 'var(--text-3)', fontSize: 13, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Sin API key requerida', 'Gratis para empezar', 'Listo en 30 segundos'].map(t => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={13} style={{ color: 'var(--accent)' }} /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 28px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 48 }}>
            Todo en una plataforma
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { icon: Sparkles, title: 'Carruseles con IA', desc: 'De un prompt a 10 slides premium con copy, diseño e imágenes. Sin configuración.' },
              { icon: Layers,   title: 'Editor visual',    desc: 'Edita cada slide con el canvas. Texto, colores, capas. Control total.' },
              { icon: Grid3x3,  title: 'Grid Maker',       desc: 'Divide imágenes para Instagram. Descarga tiles numerados en ZIP.' },
              { icon: Video,    title: 'AI Reels',         desc: 'Storyboards visuales para tus Reels. Genera 4 frames del concepto al instante.' },
            ].map((f, i) => (
              <div key={i} className="card fade-up" style={{ padding: 24, animationDelay: `${i * 0.08}s` }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent-d)', border: '1px solid var(--accent-b)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <f.icon size={17} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 7 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section style={{ padding: '100px 28px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--accent-d)', border: '1px solid var(--accent-b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Sparkles size={26} style={{ color: 'var(--accent)' }} />
          </div>
        </div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
          Empieza ahora — es gratis
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 36 }}>
          Sin tarjeta de crédito. Sin registro. Solo escribe tu idea.
        </p>
        <button className="btn btn-lg" onClick={() => navigate('/create')}>
          <Sparkles size={18} /> Crear mi primer carrusel
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, fontSize: 15 }}>
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="4" fill="var(--accent)"/>
            <circle cx="20" cy="20" r="9" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.6"/>
            <circle cx="20" cy="20" r="15" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.3"/>
          </svg>
          AURE
        </div>
        <p style={{ color: 'var(--text-3)', fontSize: 13 }}>© 2026 AURE · AI Content Studio</p>
      </footer>
    </div>
  )
}
