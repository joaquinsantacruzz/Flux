import bcrypt from 'bcryptjs'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  }
}

// ── REST helper ───────────────────────────────────────────────────────────────

async function rest(method, table, body = null, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`
  const options = { method, headers: getHeaders() }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Error ${res.status}`)
  }
  if (res.status === 204 || res.status === 201) return null
  return res.json()
}

// ── Auth local ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'flux_session'

export async function loginWithCedula(cedula, password) {
  const rows = await rest('GET', 'usuarios', null, `?cedula=eq.${encodeURIComponent(cedula.trim())}&select=*`)
  if (!rows || rows.length === 0) throw new Error('Cédula no encontrada')
  const user = rows[0]
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw new Error('Contraseña incorrecta')
  const session = { user: { id: user.id, nombre: user.nombre, cedula: user.cedula, email: user.email } }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export async function registerUser(cedula, password, nombre, email) {
  cedula = cedula.trim()
  email = email.trim().toLowerCase()

  // Verificar duplicados antes de insertar para dar mensajes claros
  const [byCed, byEmail] = await Promise.all([
    rest('GET', 'usuarios', null, `?cedula=eq.${encodeURIComponent(cedula)}&select=id`),
    rest('GET', 'usuarios', null, `?email=eq.${encodeURIComponent(email)}&select=id`),
  ])
  if (byCed && byCed.length > 0) throw new Error('Ya existe una cuenta con esa cédula')
  if (byEmail && byEmail.length > 0) throw new Error('Ya existe una cuenta con ese correo')

  const password_hash = await bcrypt.hash(password, 10)
  await rest('POST', 'usuarios', { cedula, password_hash, nombre, email })
}

export function localSignOut() {
  localStorage.removeItem(SESSION_KEY)
}

export function loadLocalSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

// ── Movimientos ───────────────────────────────────────────────────────────────

export const movimientos = {
  list: (userId) =>
    rest('GET', 'movimientos', null,
      `?usuario_id=eq.${userId}&order=fecha.desc&select=*`),

  create: (data) => rest('POST', 'movimientos', data),

  update: (id, data) =>
    rest('PATCH', 'movimientos', data, `?id=eq.${id}`),

  delete: (id) =>
    rest('DELETE', 'movimientos', null, `?id=eq.${id}`)
}

// ── Metas ─────────────────────────────────────────────────────────────────────

export const metas = {
  list: (userId) =>
    rest('GET', 'metas', null, `?usuario_id=eq.${userId}&select=*`),

  create: (data) => rest('POST', 'metas', data),

  update: (id, data) =>
    rest('PATCH', 'metas', data, `?id=eq.${id}`),

  delete: (id) =>
    rest('DELETE', 'metas', null, `?id=eq.${id}`)
}

// ── Deudas ────────────────────────────────────────────────────────────────────

export const deudas = {
  list: (userId) =>
    rest('GET', 'deudas', null, `?usuario_id=eq.${userId}&select=*`),

  create: (data) => rest('POST', 'deudas', data),

  update: (id, data) =>
    rest('PATCH', 'deudas', data, `?id=eq.${id}`),

  delete: (id) =>
    rest('DELETE', 'deudas', null, `?id=eq.${id}`)
}

// ── Cuotas ────────────────────────────────────────────────────────────────────

export const cuotas = {
  list: (userId) =>
    rest('GET', 'cuotas', null, `?usuario_id=eq.${userId}&select=*`),

  create: (data) => rest('POST', 'cuotas', data),

  update: (id, data) =>
    rest('PATCH', 'cuotas', data, `?id=eq.${id}`),

  delete: (id) =>
    rest('DELETE', 'cuotas', null, `?id=eq.${id}`)
}
