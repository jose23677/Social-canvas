import { createClient } from '@supabase/supabase-js'

function getClient() {
  const url = localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || ''
  const key = localStorage.getItem('supabase_key') || import.meta.env.VITE_SUPABASE_KEY || ''
  if (!url || !key) return null
  return createClient(url, key)
}

export const getSupabase = () => getClient()

export async function signIn(email, password) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  return sb.auth.signInWithPassword({ email, password })
}

export async function signUp(email, password, name) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  return sb.auth.signUp({ email, password, options: { data: { name } } })
}

export async function signOut() {
  const sb = getSupabase()
  if (!sb) return
  return sb.auth.signOut()
}

export async function signInWithGoogle() {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  return sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/social-canvas/' },
  })
}

export async function getSession() {
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  return data.session
}

export async function getApiKeys(userId) {
  const sb = getSupabase()
  if (!sb) return []
  const { data } = await sb.from('api_keys').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return data || []
}

export async function createApiKey(userId, name, key) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  return sb.from('api_keys').insert({ user_id: userId, name, key, created_at: new Date().toISOString() })
}

export async function revokeApiKey(id) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  return sb.from('api_keys').delete().eq('id', id)
}

export async function saveProject(userId, project) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  if (project.id) {
    return sb.from('projects').update({ ...project, updated_at: new Date().toISOString() }).eq('id', project.id)
  }
  return sb.from('projects').insert({ ...project, user_id: userId, created_at: new Date().toISOString() })
}

export async function getProjects(userId) {
  const sb = getSupabase()
  if (!sb) return []
  const { data } = await sb.from('projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
  return data || []
}

export async function deleteProject(id) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  return sb.from('projects').delete().eq('id', id)
}
