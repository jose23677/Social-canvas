import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import {
  ArrowRight, Sparkles, Layers, LayoutGrid, Video,
  Wand2, Palette, Globe, Star, Check, Zap,
  Image as ImageIcon, ChevronRight, Command,
} from 'lucide-react'

/* ── Animation helpers ─────────────────────────────── */
const spring  = { type: 'spring', stiffness: 80, damping: 20 }
const easeOut = { ease: [0.16, 1, 0.3, 1] }

function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ...easeOut }}>
      {children}
    </motion.div>
  )
}

function Stagger({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} className={className}
      initial="hidden" animate={inView ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: delay } } }}>
      {children}
    </motion.div>
  )
}

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ...easeOut } },
}

/* ── Logo mark ─────────────────────────────────────── */
function AuraLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="3.5" fill="#C8A97A"/>
      <circle cx="20" cy="20" r="8"   fill="none" stroke="#C8A97A" strokeWidth="1.2" opacity="0.65"/>
      <circle cx="20" cy="20" r="13.5" fill="none" stroke="#C8A97A" strokeWidth="0.8" opacity="0.35"/>
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="#C8A97A" strokeWidth="0.5" opacity="0.16"/>
    </svg>
  )
}

/* ── Data ──────────────────────────────────────────── */
const SLIDES = [
  { bg: '#0E0C0A', accent: '#C8A97A', label: 'ESTÉTICA · PREMIUM', h1: 'Resultados', h2: 'que enamoran', note: 'Tratamientos de precisión' },
  { bg: '#0A0C0E', accent: '#8B9CC8', label: 'SKINCARE · LIFESTYLE', h1: 'Tu piel,', h2: 'transformada', note: 'Rutina de alto rendimiento' },
  { bg: '#0A0E0A', accent: '#7AB898', label: 'WELLNESS · MARCA', h1: 'Bienestar', h2: 'sin límites', note: 'Contenido que convierte' },
]

const FEATURES = [
  { icon: Wand2,     title: 'AI Carousel Generator', desc: 'De un prompt a 10 slides premium con copy, diseño e imágenes. Segundos, no horas.' },
  { icon: ImageIcon, title: 'AI Image Engine',        desc: 'Imágenes hiperrealistas generadas con Flux AI. Calidad de campaña internacional.' },
  { icon: Zap,       title: 'Viral Hook Generator',   desc: 'La IA detecta qué detiene el scroll y genera hooks de alta retención.' },
  { icon: Layers,    title: 'Canvas Editor',          desc: 'Editor visual profesional. Edita cada elemento con precisión de diseñador.' },
  { icon: Palette,   title: 'Brand Memory AI',        desc: 'La IA aprende tu identidad de marca y la mantiene consistente siempre.' },
  { icon: LayoutGrid,title: 'Feed Simulator',         desc: 'Visualiza tu perfil antes de publicar. Arrastra, reordena y optimiza.' },
  { icon: Video,     title: 'AI Reels Studio',        desc: 'Guiones, storyboards y conceptos visuales para reels de alto impacto.' },
  { icon: Globe,     title: 'Multi-format Export',    desc: 'PNG, JPG, PDF en alta resolución. Listo para publicar en segundos.' },
  { icon: Star,      title: 'Premium Templates',      desc: 'Biblioteca curatorial de plantillas diseñadas para máxima conversión.' },
]

const STEPS = [
  { n: '01', title: 'Escribe tu prompt', desc: 'Describe en lenguaje natural el contenido que quieres. Tema, tono, audiencia, estilo. Sin formularios complejos.' },
  { n: '02', title: 'AURA diseña todo', desc: 'La IA genera 10 slides completos: estructura, copy, imágenes premium, hooks virales y CTA optimizado.' },
  { n: '03', title: 'Edita y exporta', desc: 'Ajusta cualquier elemento en el editor visual y exporta en alta resolución listo para publicar.' },
]

const TESTIMONIALS = [
  { init: 'VR', name: 'Valentina R.', role: 'Clínica Estética · @valentinaest', text: 'En 90 segundos tengo un carrusel que antes tardaba 3 horas. La calidad visual es de agencia internacional.', stars: 5 },
  { init: 'CM', name: 'Carlos M.', role: 'Creative Director · @cmstudio_co', text: 'Mis clientes no creen que lo hago solo. El nivel editorial es brutal. Lo uso para todos mis clientes.', stars: 5 },
  { init: 'AS', name: 'Ana Sofía G.', role: 'Beauty Brand · @anasofiaglam', text: 'Pasé de 3 publicaciones semanales a 7. El engagement se triplicó en 6 semanas. AURA cambió mi negocio.', stars: 5 },
]

const NICHES = ['Medicina Estética', 'Skincare', 'Moda', 'Fitness', 'Real Estate', 'Restaurantes', 'Coaching', 'Tecnología', 'Arquitectura', 'Lujo']

/* ── Component ─────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const heroParallax = useTransform(scrollY, [0, 600], [0, -60])
  const heroFade     = useTransform(scrollY, [0, 500], [1, 0])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ━━━━━━━━━━━━━━ NAV ━━━━━━━━━━━━━━ */}
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ...easeOut }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(24px) saturate(140%)',
          background: 'rgba(9,8,7,0.88)',
        }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AuraLogo size={30} />
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.025em', color: 'var(--text)' }}>
              aura
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {['Características', 'Plantillas', 'Precios'].map(item => (
              <button key={item} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>
                {item}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }} onClick={() => navigate('/auth')}>
              Entrar
            </button>
            <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => navigate('/studio')}>
              Crear gratis <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '130px 32px 80px', position: 'relative', overflow: 'hidden' }}>

        {/* Cinematic background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="line-grid" style={{ position: 'absolute', inset: 0 }} />
          {/* Warm glow orbs */}
          <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, background: 'radial-gradient(ellipse, rgba(200,169,122,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '40%', left: '12%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(200,169,122,0.04) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '25%', right: '8%', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(139,156,200,0.04) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />
        </div>

        <motion.div style={{ y: heroParallax, opacity: heroFade, maxWidth: 860, width: '100%', textAlign: 'center', position: 'relative', zIndex: 2 }}>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ...easeOut }}>
            <div className="badge" style={{ marginBottom: 36, padding: '6px 16px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 2.5s ease-in-out infinite' }} />
              IA GENERATIVA · CONTENIDO PREMIUM
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="type-display"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ...easeOut }}
            style={{ marginBottom: 24 }}>
            <span className="text-warm">El estudio creativo</span><br />
            <span className="text-gold">que piensa por ti</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ...easeOut }}
            style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.78, fontWeight: 400 }}>
            Genera carruseles premium, imágenes cinematográficas y contenido editorial de calidad de agencia creativa. Solo un prompt.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3, ...easeOut }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <button className="btn btn-cta" onClick={() => navigate('/studio')} style={{ gap: 10 }}>
              <Sparkles size={17} strokeWidth={2} />
              Crear mi carrusel gratis
            </button>
            <button className="btn btn-ghost-lg" onClick={() => navigate('/studio?tab=templates')}>
              Ver plantillas <ChevronRight size={15} />
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, color: 'var(--text-3)', fontSize: 13, flexWrap: 'wrap' }}>
            {['Sin API key', 'Listo en 30 segundos', 'Gratis para empezar'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Check size={13} style={{ color: 'var(--accent)' }} strokeWidth={2.5} /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating carousel cards */}
        <div style={{ position: 'relative', marginTop: 88, width: '100%', maxWidth: 920, display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'flex-start', zIndex: 2 }}>
          {SLIDES.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 64, rotate: (i - 1) * 4 }}
              animate={{ opacity: 1, y: 0, rotate: (i - 1) * 3 }}
              transition={{ delay: 0.55 + i * 0.12, duration: 0.9, ...easeOut }}
              style={{
                width: 210, aspectRatio: '4/5', borderRadius: 18,
                overflow: 'hidden', border: '1px solid rgba(240,234,226,0.08)',
                boxShadow: 'var(--shadow-float)',
                flexShrink: 0, position: 'relative',
                transform: i === 1 ? 'scale(1.06)' : 'scale(0.93)',
                zIndex: i === 1 ? 3 : 1,
                animation: `${i % 2 === 0 ? 'float' : 'float-sm'} ${5 + i * 0.8}s ease-in-out infinite`,
                animationDelay: `${i * 0.6}s`,
              }}>
              <div style={{ position: 'absolute', inset: 0, background: s.bg }} />
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${s.accent}08 0%, transparent 60%)` }} />
              <div style={{ position: 'absolute', inset: 0, padding: 18, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.18em', color: s.accent, background: `${s.accent}12`, padding: '3px 9px', borderRadius: 99, alignSelf: 'flex-start', border: `0.5px solid ${s.accent}25` }}>
                  {s.label}
                </span>
                <div style={{ marginTop: 'auto' }}>
                  <p style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 700, color: '#F0EAE2', lineHeight: 1.1 }}>{s.h1}</p>
                  <p style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 700, color: '#F0EAE2', lineHeight: 1.1 }}>{s.h2}</p>
                  <p style={{ fontSize: 9, color: s.accent, marginTop: 8, opacity: 0.8 }}>{s.note}</p>
                  <div style={{ width: 24, height: 1.5, background: s.accent, marginTop: 12, opacity: 0.6 }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━━━━━ */}
      <section style={{ padding: '120px 32px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 72 }}>
            <div className="badge badge-dim" style={{ marginBottom: 20 }}>Flujo de trabajo</div>
            <h2 className="type-section" style={{ marginBottom: 16 }}>
              <span className="text-warm">De idea a carrusel</span><br />
              <span className="text-gold">en 3 pasos</span>
            </h2>
            <p className="type-subhead" style={{ maxWidth: 440, margin: '0 auto' }}>
              Sin diseñador. Sin agencia. Sin esperas.
            </p>
          </FadeUp>

          <Stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
            {STEPS.map((s, i) => (
              <motion.div key={i} variants={cardVariant}
                style={{ padding: '44px 36px', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, var(--accent), transparent)`, opacity: 0.4 }} />
                <p style={{ fontFamily: "'Georgia', serif", fontSize: 64, fontWeight: 700, color: 'var(--border-h)', lineHeight: 1, marginBottom: 24, letterSpacing: '-0.02em' }}>{s.n}</p>
                <h3 className="type-heading" style={{ marginBottom: 12 }}>{s.title}</h3>
                <p className="type-body" style={{ fontSize: 14, lineHeight: 1.78 }}>{s.desc}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━ FEATURES ━━━━━━━━━━━━━━ */}
      <section style={{ padding: '120px 32px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 72 }}>
            <div className="badge" style={{ marginBottom: 20 }}>Capacidades IA</div>
            <h2 className="type-section" style={{ marginBottom: 16 }}>
              <span className="text-warm">Una agencia creativa</span><br />
              <span className="text-gold-soft">dentro de tu pantalla</span>
            </h2>
            <p className="type-subhead" style={{ maxWidth: 460, margin: '0 auto' }}>
              Todo lo que necesitas para crear contenido premium, sin intermediarios.
            </p>
          </FadeUp>

          <Stagger delay={0.05} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 10 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={cardVariant}
                className="card"
                style={{ padding: 28 }}
                whileHover={{ y: -3, borderColor: 'var(--accent-border)' }}
                transition={{ duration: 0.2 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--accent-deep)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <f.icon size={19} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 9, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.72 }}>{f.desc}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━ TEMPLATE GALLERY ━━━━━━━━━━━━━━ */}
      <section style={{ padding: '120px 0', borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="badge badge-dim" style={{ marginBottom: 20 }}>Plantillas</div>
            <h2 className="type-section" style={{ marginBottom: 16 }}>
              <span className="text-warm">Diseños de nivel</span><br />
              <span className="text-gold">editorial premium</span>
            </h2>
          </FadeUp>
        </div>

        {/* Scrolling strip */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 32px 8px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {[...SLIDES, ...SLIDES, ...SLIDES, ...SLIDES].map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.06, duration: 0.5, ...easeOut }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.22 } }}
              style={{ width: 170, aspectRatio: '4/5', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0, position: 'relative', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
              <div style={{ position: 'absolute', inset: 0, background: s.bg }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                <p style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.15em', color: s.accent, marginBottom: 5 }}>{s.label}</p>
                <p style={{ fontFamily: "'Georgia', serif", fontSize: 14, fontWeight: 700, color: '#F0EAE2', lineHeight: 1.2 }}>{s.h1}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/studio')} style={{ padding: '11px 24px' }}>
            Explorar plantillas <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━ NICHES ━━━━━━━━━━━━━━ */}
      <section style={{ padding: '72px 32px', borderTop: '1px solid var(--border)' }}>
        <FadeUp style={{ textAlign: 'center', marginBottom: 28 }}>
          <p className="type-label">Funciona para cualquier industria</p>
        </FadeUp>
        <Stagger style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {NICHES.map((n, i) => (
            <motion.span key={i} variants={cardVariant} className="chip" style={{ padding: '8px 18px', fontSize: 13 }}>{n}</motion.span>
          ))}
        </Stagger>
      </section>

      {/* ━━━━━━━━━━━━━━ TESTIMONIALS ━━━━━━━━━━━━━━ */}
      <section style={{ padding: '120px 32px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="badge badge-dim" style={{ marginBottom: 20 }}>Testimonios</div>
            <h2 className="type-section">
              <span className="text-warm">Creadores que ya</span><br />
              <span className="text-gold">publican con AURA</span>
            </h2>
          </FadeUp>

          <Stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={cardVariant} className="card" style={{ padding: 32 }}
                whileHover={{ y: -4, borderColor: 'var(--border-h)', transition: { duration: 0.2 } }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 22 }}>
                  {Array(t.stars).fill(0).map((_, j) => <Star key={j} size={13} fill="#C8A97A" color="#C8A97A" />)}
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.78, marginBottom: 26, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent-deep)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>
                    {t.init}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━ FINAL CTA ━━━━━━━━━━━━━━ */}
      <section style={{ padding: '140px 32px', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="dot-grid" style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(200,169,122,0.06) 0%, transparent 70%)' }} />
        </div>

        <FadeUp style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'var(--accent-deep)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'glow-aura 3s ease-in-out infinite' }}>
              <AuraLogo size={36} />
            </div>
          </div>
          <h2 className="type-section" style={{ marginBottom: 20 }}>
            <span className="text-warm">Empieza a crear</span><br />
            <span className="text-gold">ahora mismo</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-2)', maxWidth: 500, margin: '0 auto 44px', lineHeight: 1.8 }}>
            Sin tarjeta de crédito. Sin configuraciones técnicas.<br />Solo escribe tu idea — AURA hace el resto.
          </p>
          <button className="btn btn-cta" style={{ padding: '15px 36px', fontSize: 16 }} onClick={() => navigate('/studio')}>
            <Sparkles size={20} strokeWidth={2} /> Crear mi primer carrusel
          </button>
          <p style={{ marginTop: 20, color: 'var(--text-3)', fontSize: 13 }}>Gratis para siempre en el plan básico</p>
        </FadeUp>
      </section>

      {/* ━━━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━━━ */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AuraLogo size={26} />
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>aura</span>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>© 2026 AURA · AI-powered creative studio</p>
        </div>
      </footer>
    </div>
  )
}
