import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, Trash2, ExternalLink } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getProjects, deleteProject } from '../lib/supabase'
import { Button, Card, Badge } from '../components/UI'
import { FORMATS } from '../lib/formats'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const LOCAL_KEY = 'sc_local_projects'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') } catch { return [] }
}

export default function GalleryPage() {
  const { t } = useTranslation()
  const { user, setSlides, setFormat, setCurrentSlide } = useStore()
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
    if (p.slides) {
      setSlides(p.slides)
      setCurrentSlide(0)
    }
    if (p.format) setFormat(p.format)
    navigate('/')
    toast.success('Proyecto cargado en el editor')
  }

  const deleteP = async (p) => {
    if (!confirm('¿Eliminar este proyecto?')) return
    if (user) {
      await deleteProject(p.id).catch(() => {})
      const updated = await getProjects(user.id).catch(() => [])
      setProjects(updated)
    } else {
      const local = loadLocal().filter((x) => x.id !== p.id)
      localStorage.setItem(LOCAL_KEY, JSON.stringify(local))
      setProjects(local)
    }
    toast.success('Proyecto eliminado')
  }

  const formatLabel = (key) => FORMATS[key] ? `${key} (${FORMATS[key].width}×${FORMATS[key].height})` : key

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-indigo-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          <LayoutGrid className="w-5 h-5 text-white" />
        </div>
        {t('gallery.title')}
      </h1>

      {!user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
          💡 <Link to="/auth" className="underline font-medium">Inicia sesión</Link> para sincronizar tus proyectos en la nube.
        </div>
      )}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <LayoutGrid className="w-14 h-14 text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg">{t('gallery.empty')}</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Ir al editor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative overflow-hidden">
                {p.thumbnail ? (
                  <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl text-slate-200 dark:text-slate-700">🖼</div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openProject(p)}
                    className="bg-white rounded-full p-2 hover:bg-indigo-50 transition-colors"
                    title={t('gallery.open')}
                  >
                    <ExternalLink className="w-4 h-4 text-slate-900" />
                  </button>
                  <button
                    onClick={() => deleteP(p)}
                    className="bg-white rounded-full p-2 hover:bg-red-50 transition-colors"
                    title={t('gallery.delete')}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{p.title || 'Sin título'}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="primary">{p.format || 'square'}</Badge>
                  {p.slides && <span className="text-xs text-slate-400">{p.slides.length} diap.</span>}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
