import { useState, useEffect } from 'react'
import { LayoutGrid, Trash2, ExternalLink, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getProjects, deleteProject } from '../lib/supabase'
import { FORMATS } from '../lib/formats'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const LOCAL_KEY = 'sc_local_projects'
const loadLocal = () => { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') } catch { return [] } }

export default function GalleryPage() {
  const { user, setSlides, setFormat, setCurrentSlide, setStudioSlides } = useStore()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      if (user) {
        const data = await getProjects(user.id).catch(() => [])
        setProjects(data.length ? data : loadLocal())
      } else {
        setProjects(loadLocal())
      }
      setLoading(false)
    }
    load()
  }, [user])

  const openProject = (p) => {
    if (p.slides) { setSlides(p.slides); setStudioSlides(null); setCurrentSlide(0) }
    if (p.format) setFormat(p.format)
    navigate('/editor')
    toast.success('Proyecto cargado')
  }

  const deleteP = async (p) => {
    if (!confirm('¿Eliminar este proyecto?')) return
    if (user) {
      await deleteProject(p.id).catch(() => {})
      const updated = await getProjects(user.id).catch(() => [])
      setProjects(updated)
    } else {
      const local = loadLocal().filter(x => x.id !== p.id)
      localStorage.setItem(LOCAL_KEY, JSON.stringify(local))
      setProjects(local)
    }
    toast.success('Eliminado')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  return (
    <div style={{ padding: '48px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="label" style={{ marginBottom: 8 }}>Tus creaciones</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Galería</h1>
        </div>
        <Link to="/studio" className="btn-primary">
          <Plus size={16} /> Nueva creación
        </Link>
      </div>

      {!user && (
        <div style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.3)', background: 'var(--accent-glow)', marginBottom: 32, fontSize: 14, color: 'var(--text-2)' }}>
          <Link to="/auth" style={{ color: 'var(--accent-h)', fontWeight: 600 }}>Inicia sesión</Link> para sincronizar tus proyectos en la nube.
        </div>
      )}

      {projects.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <LayoutGrid size={28} style={{ color: 'var(--text-3)' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aún no tienes creaciones</h3>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>Crea tu primer carrusel con IA</p>
          <Link to="/studio" className="btn-primary">Crear ahora</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {projects.map((p) => (
            <div key={p.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ aspectRatio: '1', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                onClick={() => openProject(p)}>
                {p.thumbnail
                  ? <img src={p.thumbnail} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <LayoutGrid size={32} style={{ color: 'var(--text-3)' }} />
                }
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.opacity = 1 }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = 0 }}>
                  <ExternalLink size={22} style={{ color: 'white' }} />
                </div>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title || 'Sin título'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{p.format || 'square'} · {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : ''}</p>
                </div>
                <button onClick={() => deleteP(p)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', transition: 'color 0.2s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
