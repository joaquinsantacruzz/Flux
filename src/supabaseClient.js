const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Token de sesión almacenado localmente
let _session = null

function getHeaders(withAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  }
  if (withAuth && _session?.access_token) {
    headers['Authorization'] = `Bearer ${_session.access_token}`
  } else {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
  }
  return headers
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signUp(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.msg || data.error_description || 'Error al registrar')
  return data
}

export async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || 'Credenciales incorrectas')
  _session = data
  localStorage.setItem('flux_session', JSON.stringify(data))
  return data
}

export function signOut() {
  _session = null
  localStorage.removeItem('flux_session')
}

export function loadSession() {
  const raw = localStorage.getItem('flux_session')
  if (raw) {
    _session = JSON.parse(raw)
  }
  return _session
}

export function getSession() {
  return _session
}

// ── REST helpers ──────────────────────────────────────────────────────────────

async function rest(method, table, body = null, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`
  const options = { method, headers: getHeaders() }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// ── Transacciones ─────────────────────────────────────────────────────────────

export const transacciones = {
  list: (userId) =>
    rest('GET', 'transacciones', null,
      `?user_id=eq.${userId}&order=fecha.desc&select=*`),

  create: (data) => rest('POST', 'transacciones', data),

  update: (id, data) =>
    rest('PATCH', 'transacciones', data, `?id=eq.${id}`),

  delete: (id) =>
    rest('DELETE', 'transacciones', null, `?id=eq.${id}`)
}

// ── Metas ─────────────────────────────────────────────────────────────────────

export const metas = {
  list: (userId) =>
    rest('GET', 'metas', null, `?user_id=eq.${userId}&select=*`),

  create: (data) => rest('POST', 'metas', data),

  update: (id, data) =>
    rest('PATCH', 'metas', data, `?id=eq.${id}`),

  delete: (id) =>
    rest('DELETE', 'metas', null, `?id=eq.${id}`)
}

// ── Deudas ────────────────────────────────────────────────────────────────────

export const deudas = {
  list: (userId) =>
    rest('GET', 'deudas', null, `?user_id=eq.${userId}&select=*`),

  create: (data) => rest('POST', 'deudas', data),

  update: (id, data) =>
    rest('PATCH', 'deudas', data, `?id=eq.${id}`),

  delete: (id) =>
    rest('DELETE', 'deudas', null, `?id=eq.${id}`)
}

// ── Cuotas ────────────────────────────────────────────────────────────────────

export const cuotas = {
  list: (userId) =>
    rest('GET', 'cuotas', null, `?user_id=eq.${userId}&select=*`),

  create: (data) => rest('POST', 'cuotas', data),

  update: (id, data) =>
    rest('PATCH', 'cuotas', data, `?id=eq.${id}`),

  delete: (id) =>
    rest('DELETE', 'cuotas', null, `?id=eq.${id}`)
}
