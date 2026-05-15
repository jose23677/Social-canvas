import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Key, Plus, Copy, Trash2, BookOpen, CheckCircle, ExternalLink } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useStore } from '../store/useStore'
import { getApiKeys, createApiKey, revokeApiKey } from '../lib/supabase'
import { Button, Input, Card, Badge, Modal } from '../components/UI'
import toast from 'react-hot-toast'

const LOCAL_KEY = 'sc_local_api_keys'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') } catch { return [] }
}
function saveLocal(keys) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(keys))
}

export default function ApiKeysPage() {
  const { t } = useTranslation()
  const { user } = useStore()
  const [keys, setKeys] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState(null)
  const [copied, setCopied] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      getApiKeys(user.id).then(setKeys).catch(() => setKeys(loadLocal()))
    } else {
      setKeys(loadLocal())
    }
  }, [user])

  const generateKey = async () => {
    if (!newKeyName.trim()) return toast.error(t('common.required'))
    setLoading(true)
    const key = `sc_${uuidv4().replace(/-/g, '')}`
    const record = {
      id: uuidv4(),
      name: newKeyName,
      key,
      created_at: new Date().toISOString(),
      last_used_at: null,
    }
    try {
      if (user) {
        await createApiKey(user.id, newKeyName, key)
        const updated = await getApiKeys(user.id)
        setKeys(updated)
      } else {
        const updated = [record, ...keys]
        setKeys(updated)
        saveLocal(updated)
      }
      setNewKey(key)
      setNewKeyName('')
      setShowCreate(false)
      toast.success(t('apikeys.keyCreated'))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const revoke = async (id) => {
    if (!confirm(t('apikeys.confirmRevoke'))) return
    try {
      if (user) {
        await revokeApiKey(id)
        const updated = await getApiKeys(user.id)
        setKeys(updated)
      } else {
        const updated = keys.filter((k) => k.id !== id)
        setKeys(updated)
        saveLocal(updated)
      }
      toast.success('Key revocada')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const copyKey = (key, id) => {
    navigator.clipboard.writeText(key)
    setCopied(id)
    toast.success(t('apikeys.copied'))
    setTimeout(() => setCopied(null), 2000)
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : t('apikeys.never')

  const baseUrl = window.location.origin + '/social-canvas/api'

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Key className="w-5 h-5 text-white" />
          </div>
          {t('apikeys.title')}
        </h1>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowDocs(true)}>
            <BookOpen className="w-4 h-4" /> {t('apikeys.docs')}
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> {t('apikeys.generate')}
          </Button>
        </div>
      </div>

      <p className="text-slate-500 dark:text-slate-400 text-sm">{t('apikeys.description')}</p>

      {!user && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
          ⚠️ Sin cuenta conectada — las keys se guardan localmente. <a href="/auth" className="underline font-medium">Inicia sesión</a> para sincronizarlas.
        </div>
      )}

      {/* New key shown once */}
      {newKey && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-800 dark:text-green-300">¡API Key creada! Cópiala ahora, no se mostrará de nuevo.</p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-green-200 dark:border-green-800">
            <code className="flex-1 text-sm font-mono text-slate-800 dark:text-slate-200 break-all">{newKey}</code>
            <button onClick={() => copyKey(newKey, 'new')} className="text-green-600 hover:text-green-700">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="text-xs text-slate-500 mt-2 hover:underline">Entendido, cerrar</button>
        </Card>
      )}

      {/* Keys list */}
      <div className="space-y-3">
        {keys.length === 0 ? (
          <Card className="text-center py-12">
            <Key className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">{t('apikeys.noKeys')}</p>
            <Button size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> {t('apikeys.generate')}
            </Button>
          </Card>
        ) : (
          keys.map((k) => (
            <Card key={k.id} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{k.name}</p>
                <p className="text-xs text-slate-400 font-mono truncate">{k.key}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-slate-400">{t('apikeys.created')}: {formatDate(k.created_at)}</span>
                  <span className="text-xs text-slate-400">{t('apikeys.lastUsed')}: {formatDate(k.last_used_at)}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => copyKey(k.key, k.id)} title={t('apikeys.copy')}>
                  {copied === k.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => revoke(k.id)} title={t('apikeys.revoke')}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('apikeys.generate')}>
        <div className="space-y-4">
          <Input
            label={t('apikeys.name')}
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder={t('apikeys.namePlaceholder')}
            onKeyDown={(e) => e.key === 'Enter' && generateKey()}
          />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 justify-center" onClick={() => setShowCreate(false)}>
              {t('common.cancel')}
            </Button>
            <Button className="flex-1 justify-center" onClick={generateKey} disabled={loading}>
              {loading ? t('common.loading') : t('apikeys.generate')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Docs modal */}
      <Modal open={showDocs} onClose={() => setShowDocs(false)} title={`${t('apikeys.docs')} — Social Canvas API`} wide>
        <div className="space-y-6 text-sm">
          <div className="bg-slate-900 rounded-xl p-4 text-green-400 font-mono text-xs overflow-x-auto">
            <p className="text-slate-400 mb-2"># Base URL</p>
            <p>{baseUrl}</p>
          </div>

          {[
            {
              method: 'GET', path: '/projects', desc: 'Lista todos los proyectos del usuario',
              headers: 'Authorization: Bearer sc_YOUR_KEY',
              response: `[{ "id": "...", "title": "Mi diseño", "format": "square", "created_at": "..." }]`,
            },
            {
              method: 'POST', path: '/generate-image', desc: 'Genera una imagen con IA y la guarda',
              headers: 'Authorization: Bearer sc_YOUR_KEY\nContent-Type: application/json',
              body: `{ "prompt": "ciudad al atardecer", "provider": "stability", "style": "cinematic" }`,
              response: `{ "image_url": "https://...", "created_at": "..." }`,
            },
            {
              method: 'DELETE', path: '/projects/:id', desc: 'Elimina un proyecto',
              headers: 'Authorization: Bearer sc_YOUR_KEY',
              response: `{ "success": true }`,
            },
          ].map((ep, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900">
                <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : 'danger'}>
                  {ep.method}
                </Badge>
                <code className="font-mono text-sm text-slate-800 dark:text-slate-200">{baseUrl}{ep.path}</code>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-slate-600 dark:text-slate-400">{ep.desc}</p>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Headers</p>
                  <pre className="bg-slate-100 dark:bg-slate-900 text-xs rounded-lg p-2 text-slate-700 dark:text-slate-300 whitespace-pre">{ep.headers}</pre>
                </div>
                {ep.body && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Body</p>
                    <pre className="bg-slate-100 dark:bg-slate-900 text-xs rounded-lg p-2 text-slate-700 dark:text-slate-300">{ep.body}</pre>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Response</p>
                  <pre className="bg-slate-100 dark:bg-slate-900 text-xs rounded-lg p-2 text-slate-700 dark:text-slate-300">{ep.response}</pre>
                </div>
              </div>
            </div>
          ))}

          <p className="text-xs text-slate-400 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Compatible con Zapier, Make (Integromat), n8n y cualquier cliente HTTP
          </p>
        </div>
      </Modal>
    </div>
  )
}
