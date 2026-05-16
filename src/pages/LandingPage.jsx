import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import {
  Sparkles, ArrowRight, Zap, Layers, Image, LayoutGrid,
  Video, Star, Check, ChevronRight, Wand2, Palette, Globe,
} from 'lucide-react'

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }
const fadeIn  = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }
const staggerFast = { show: { transition: { staggerChildren: 0.07 } } }
const scaleIn = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }

function Section({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

// ── Mock carousel slides ──────────────────────────────────────────────────────
const MOCK_SLIDES = [
  {
    bg: 'linear-gradient(145deg, #0c1428 0%, #111827 100%)',
    accent: '#818cf8',
    label: 'MEDICINA ESTÉTICA',
    title: ['Resultados', 'que inspiran'],
    sub: 'Tratamientos de precisión',
    img: 'https://image.pollinations.ai/prompt/elegant%20woman%20glowing%20skin%20luxury%20editorial%20champagne?model=flux&width=300&height=380&seed=101&nologo=true',
  },
  {
    bg: 'linear-gradient(145deg, #0d1117 0%, #1a0a2e 100%)',
    accent: '#c084fc',
    label: 'SKINCARE PREMIUM',
    title: ['Tu piel,', 'transformada'],
    sub: 'Rutina de alto rendimiento',
    img: 'https://image.pollinations.ai/prompt/luxury%20skincare%20products%20minimal%20studio%20premium%20editorial?model=flux&width=300&height=380&seed=102&nologo=true',
  },
  {
    bg: 'linear-gradient(145deg, #0a1a0a 0%, #0f2010 100%)',
    accent: '#34d399',
    label: 'WELLNESS & VIDA',
    title: ['Bienestar', 'sin límites'],
    sub: 'Contenido que convierte',
    img: 'https://image.pollinations.ai/prompt/woman%20wellness%20lifestyle%20natural%20light%20editorial%20premium?model=flux&width=300&height=380&seed=103&nologo=true',
  },
]

const FEATURES = [
  { icon: Wand2, label: 'AI Carousel Generator', desc: 'Genera 10 slides premium desde un prompt. Copy, diseño e imágenes en segundos.' },
  { icon: Image, label: 'AI Image Engine', desc: 'Imágenes hiperrealistas con Flux AI. Calidad editorial de campaña internacional.' },
  { icon: Zap, label: 'Viral Hook Generator', desc: 'La IA crea ganchos que detienen el scroll y disparan el engagement.' },
  { icon: Layers, label: 'Canvas Editor', desc: 'Editor visual profesional. Edita, arrastra y personaliza cada slide.' },
  { icon: Palette, label: 'Brand Memory AI', desc: 'La IA aprende tu identidad de marca y la aplica automáticamente.' },
  { icon: LayoutGrid, label: 'Feed Simulator', desc: 'Previsualiza tu feed antes de publicar. Arrastra y reordena posts.' },
  { icon: Video, label: 'AI Reels Studio', desc: 'Genera guiones, storyboards y conceptos visuales para tus Reels.' },
  { icon: Globe, label: 'Multi-format Export', desc: 'Exporta en PNG, JPG y PDF en alta resolución. Listo para publicar.' },
  { icon: Star, label: 'Premium Templates', desc: 'Biblioteca de plantillas editoriales diseñadas por directores creativos.' },
]

const STEPS = [
  { n: '01', title: 'Escribe tu prompt', desc: 'Describe el contenido que quieres. Tema, tono, audiencia. La IA entiende lenguaje natural.' },
  { n: '02', title: 'La IA diseña todo', desc: '10 slides completos: texto, imágenes premium, hooks virales y CTAs optimizados.' },
  { n: '03', title: 'Edita y exporta', desc: 'Ajusta lo que necesites en el editor visual y exporta en alta resolución.' },
]

const TESTIMONIALS = [
  { name: 'Valentina R.', role: 'Médico Estética · @valentinarest', avatar: 'VR', text: 'En 2 minutos tengo un carrusel que antes me tomaba 3 horas con un diseñador. La calidad es brutal.', stars: 5 },
  { name: 'Carlos M.', role: 'Branding Agency · @cmbrand', avatar: 'CM', text: 'Mis clientes quedan impresionados. El nivel editorial es de agencia internacional. Lo uso todos los días.', stars: 5 },
  { name: 'Ana Sofía G.', role: 'Skincare Brand · @anasofiabeauty', avatar: 'AS', text: 'Pasé de publicar 2 veces por semana a 6. El contenido se ve premium y el engagement se triplicó.', stars: 5 },
]

const NICHES = ['Medicina Estética', 'Skincare', 'Fitness', 'Real Estate', 'Moda', 'Nutrición', 'Coaching', 'Arquitectura', 'Gastronomía', 'Tecnología']

// ── Component ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -80])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── Nav ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)', background: 'rgba(3,3,3,0.85)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              <Sparkles size={16} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>
              Social<span style={{ color: 'var(--indigo-h)' }}>Canvas</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {['Características', 'Plantillas', 'Precios'].map(item => (
              <button key={item} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13, fontWeight: 500 }}>
                {item}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }} onClick={() => navigate('/auth')}>
              Entrar
            </button>
            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => navigate('/studio')}>
              Crear gratis <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 28px 80px', position: 'relative', overflow: 'hidden' }}>

        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* Grid */}
          <div className="line-grid" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />
          {/* Glow orbs */}
          <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '30%', left: '15%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '20%', right: '10%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(196,168,130,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
          {/* Fade to black at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity, maxWidth: 900, width: '100%', textAlign: 'center', position: 'relative' }}>

          {/* Badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <div className="badge" style={{ padding: '6px 16px', fontSize: 11 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 8px #818cf8', animation: 'glow-pulse 2s infinite' }} />
              IA GENERATIVA · CONTENIDO PREMIUM
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="show"
            transition={{ delay: 0.1 }}
            className="h-display"
            style={{ marginBottom: 24 }}>
            <span className="text-gradient">Crea contenido viral</span><br />
            <span className="text-gradient-indigo">con IA en segundos</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show"
            transition={{ delay: 0.2 }}
            style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 580, margin: '0 auto 44px', lineHeight: 1.75, fontWeight: 400 }}>
            Genera carruseles premium, imágenes cinematográficas y contenido editorial de calidad de agencia. Solo necesitas un prompt.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show"
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <button className="btn-hero btn" onClick={() => navigate('/studio')}>
              <Sparkles size={18} strokeWidth={2.5} />
              Crear mi carrusel gratis
            </button>
            <button className="btn-ghost-lg btn" onClick={() => navigate('/studio?tab=templates')}>
              Ver plantillas <ChevronRight size={16} />
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show"
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, color: 'var(--text-3)', fontSize: 13 }}>
            {['Sin API key requerida', 'Resultado en 30 segundos', 'Gratis para empezar'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Check size={14} style={{ color: 'var(--indigo)' }} strokeWidth={2.5} /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating carousel mockups */}
        <div style={{ position: 'relative', marginTop: 80, width: '100%', maxWidth: 1000, display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'flex-start' }}>
          {MOCK_SLIDES.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 + i * 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 220,
                aspectRatio: '4/5',
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'var(--shadow-float)',
                flexShrink: 0,
                transform: `rotate(${(i - 1) * 3}deg)`,
                animation: `${i % 2 === 0 ? 'float' : 'float-r'} ${5 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
                position: 'relative',
                zIndex: i === 1 ? 2 : 1,
                scale: i === 1 ? 1.08 : 0.95,
              }}>
              <div style={{ position: 'absolute', inset: 0, background: s.bg }} />
              <img src={s.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, mixBlendMode: 'luminosity' }} onError={e => { e.target.style.opacity = 0 }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${s.bg.includes('#0c1428') ? 'rgba(12,20,40,0.3)' : 'rgba(10,10,20,0.3)'} 0%, rgba(5,5,15,0.85) 100%)` }} />
              <div style={{ position: 'absolute', inset: 0, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.18em', color: s.accent, background: `${s.accent}15`, padding: '4px 10px', borderRadius: 99, alignSelf: 'flex-start', border: `0.5px solid ${s.accent}30` }}>
                  {s.label}
                </span>
                <div style={{ marginTop: 'auto' }}>
                  {s.title.map((l, j) => (
                    <p key={j} style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{l}</p>
                  ))}
                  <p style={{ fontSize: 10, color: s.accent, marginTop: 8, opacity: 0.85 }}>{s.sub}</p>
                  <div style={{ width: 28, height: 1.5, background: s.accent, marginTop: 12, opacity: 0.7 }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '120px 28px', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Section style={{ textAlign: 'center', marginBottom: 72 }}>
            <motion.div variants={fadeUp}><div className="badge" style={{ marginBottom: 20 }}>Flujo de trabajo</div></motion.div>
            <motion.h2 variants={fadeUp} className="h-section" style={{ marginBottom: 16 }}>
              <span className="text-gradient">De idea a carrusel</span><br />en 3 pasos
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-2)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
              Sin diseñador. Sin agencia. Sin esperas.
            </motion.p>
          </Section>

          <Section>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
              {STEPS.map((s, i) => (
                <motion.div key={i} variants={scaleIn} style={{ padding: '40px 36px', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 20, position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, var(--indigo), transparent)`, opacity: 0.5 }} />
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: 72, fontWeight: 700, color: 'var(--border-h)', lineHeight: 1, marginBottom: 24, opacity: 0.6 }}>{s.n}</p>
                  <h3 className="h-card" style={{ marginBottom: 12, color: 'var(--text)' }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.75 }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '120px 28px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Section style={{ textAlign: 'center', marginBottom: 72 }}>
            <motion.div variants={fadeUp}><div className="badge badge-gold" style={{ marginBottom: 20 }}>Capacidades IA</div></motion.div>
            <motion.h2 variants={fadeUp} className="h-section" style={{ marginBottom: 16 }}>
              Una agencia creativa<br /><span className="text-gradient-aurora">impulsada por IA</span>
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-2)', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>
              Todo lo que necesitas para crear contenido premium, en un solo lugar.
            </motion.p>
          </Section>

          <Section>
            <motion.div variants={staggerFast} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
              {FEATURES.map((f, i) => (
                <motion.div key={i} variants={scaleIn}
                  className="card"
                  style={{ padding: 28, cursor: 'default' }}
                  whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.12)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--indigo-deep)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <f.icon size={20} style={{ color: 'var(--indigo-h)' }} strokeWidth={1.8} />
                  </div>
                  <h3 className="h-card" style={{ marginBottom: 10 }}>{f.label}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── Template Gallery ── */}
      <section style={{ padding: '120px 28px', borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Section style={{ textAlign: 'center', marginBottom: 60 }}>
            <motion.div variants={fadeUp}><div className="badge" style={{ marginBottom: 20 }}>Plantillas</div></motion.div>
            <motion.h2 variants={fadeUp} className="h-section" style={{ marginBottom: 16 }}>
              <span className="text-gradient">Diseños de nivel</span><br />editorial premium
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-2)', fontSize: 17 }}>
              Más de 50 plantillas diseñadas por directores creativos.
            </motion.p>
          </Section>

          {/* Scrolling template strip */}
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {[...MOCK_SLIDES, ...MOCK_SLIDES, ...MOCK_SLIDES].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.03 }}
                style={{ width: 180, aspectRatio: '4/5', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0, position: 'relative', cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ position: 'absolute', inset: 0, background: s.bg }} />
                <img src={s.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, mixBlendMode: 'luminosity' }} onError={e => { e.target.style.opacity = 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                  <p style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.15em', color: s.accent, marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{s.title[0]}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Section style={{ textAlign: 'center', marginTop: 40 }}>
            <motion.button variants={fadeUp} className="btn-ghost btn" onClick={() => navigate('/studio?tab=templates')} style={{ padding: '11px 28px' }}>
              Ver todas las plantillas <ArrowRight size={15} />
            </motion.button>
          </Section>
        </div>
      </section>

      {/* ── Niches ── */}
      <section style={{ padding: '60px 28px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Section style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
              Funciona para cualquier industria
            </motion.p>
          </Section>
          <Section>
            <motion.div variants={staggerFast} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {NICHES.map((n, i) => (
                <motion.span key={i} variants={fadeIn} className="chip" style={{ fontSize: 13, padding: '8px 18px' }}>{n}</motion.span>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '120px 28px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Section style={{ textAlign: 'center', marginBottom: 60 }}>
            <motion.div variants={fadeUp}><div className="badge" style={{ marginBottom: 20 }}>Testimonios</div></motion.div>
            <motion.h2 variants={fadeUp} className="h-section">
              <span className="text-gradient">Creadores que ya</span><br />publican con IA
            </motion.h2>
          </Section>

          <Section>
            <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={i} variants={scaleIn} className="card" style={{ padding: 32 }} whileHover={{ y: -4 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                    {Array(t.stars).fill(0).map((_, j) => <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />)}
                  </div>
                  <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '140px 28px', position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 500, background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
          <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
        </div>

        <Section style={{ textAlign: 'center', position: 'relative' }}>
          <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 80px rgba(99,102,241,0.45)', animation: 'pulse-glow 3s ease infinite' }}>
              <Sparkles size={32} color="white" strokeWidth={2} />
            </div>
          </motion.div>
          <motion.h2 variants={fadeUp} className="h-section" style={{ marginBottom: 20 }}>
            Empieza a crear<br /><span className="text-gradient-indigo">ahora mismo</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 17, color: 'var(--text-2)', maxWidth: 520, margin: '0 auto 44px', lineHeight: 1.8 }}>
            Sin tarjeta de crédito. Sin configuraciones técnicas. Solo escribe tu idea y la IA hace el resto.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-hero btn" style={{ padding: '15px 36px', fontSize: 16 }} onClick={() => navigate('/studio')}>
              <Sparkles size={20} strokeWidth={2.5} /> Crear mi primer carrusel
            </button>
          </motion.div>
          <motion.p variants={fadeUp} style={{ marginTop: 20, color: 'var(--text-3)', fontSize: 13 }}>
            Gratis para siempre en el plan básico
          </motion.p>
        </Section>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={13} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Social<span style={{ color: 'var(--indigo-h)' }}>Canvas</span></span>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>© 2026 SocialCanvas · Hecho con IA para creadores premium</p>
        </div>
      </footer>
    </div>
  )
}
