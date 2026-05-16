import { useState, useEffect } from 'react'
import { LayoutGrid, Trash2, ExternalLink, Plus, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const KEY = 'aure_projects'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }

export default function Gallery() {
  const navigate = useNavigate()
  const { setSlides, setFormat, setCurrentSlide, setStudioSlides } = useStore()
  const [projects, setProjects] = useState([])

  useEffect(() => { setProjects(load()) }, [])

  const open = (p) => {
    if (p.slides) { setSlides(p.slides); setStudioSlides(null); setCurrentSlide(0) }
    if (p.format) setFormat(p.format)
    navigate('/editor')
    toast.success('Proyecto cargado')
  }

  const del = (id) => {
    if (!confirm('¿Eliminar este proyecto?')) return
    const updated = load().filter(x => x.id !== id)
    localStorage.setItem(KEY, JSON.stringify(updated))
    setProjects(updated)
    toast.success('Eliminado')
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6 }}>Galería</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{projects.length} proyecto{projects.length !== 1 ? 's' : ''} guardado{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          <Plus size={15} /> Nuevo carrusel
        </Link>
      </div>

      {projects.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <LayoutGrid size={26} style={{ color: 'var(--text-3)' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aún no tienes proyectos</h3>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>Los carruseles que guardes aparecerán aquí</p>
          <Link to="/create" className="btn btn-primary"><Sparkles size={15} /> Crear mi primer carrusel</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {projects.map(p => (
            <div key={p.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ aspectRatio: '1', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                onClick={() => open(p)}>
                {p.thumbnail
                  ? <img src={p.thumbnail} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <LayoutGrid size={28} style={{ color: 'var(--text-3)' }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                  <ExternalLink size={20} style={{ color: 'white', opacity: 0, transition: 'opacity 0.15s' }}
                    ref={el => { if (el) { el.parentElement.onmouseenter = () => el.style.opacity = 1; el.parentElement.onmouseleave = () => el.style.opacity = 0 } }} />
                </div>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title || 'Sin título'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                    {p.format || 'portrait'} · {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <button onClick={() => del(p.id)} style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', borderRadius: 6, transition: 'color 0.15s', flexShrink: 0, fontFamily: 'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
