import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { movimientos } from '../supabaseClient'
import Modal from '../components/Modal'
import FormTransaccion from '../components/FormTransaccion'

const TIPS = [
  'Guardá el 10% de cada ingreso apenas te entra, antes de gastar nada. Lo que no ves, no lo gastás.',
  'Revisá tus suscripciones una vez al mes. La mayoría tiene al menos una que ya no usa.',
  'Antes de una compra grande, esperá 48 horas. Si todavía la querés, probablemente la necesitás.',
  'El fondo de emergencia ideal cubre 3 a 6 meses de gastos fijos. Empezá con lo que puedas.',
  'Anotá cada gasto, por más chico que sea. Los gastos hormiga son los que más te vacían.',
  'Comparar precios antes de comprar puede ahorrarte entre un 10% y un 30% en el mismo producto.',
  'Las tarjetas de crédito no son dinero extra — son deuda futura. Usálas solo si podés pagar el total.',
  'Un presupuesto no es una restricción, es un plan para gastar en lo que realmente importa.',
  'Invertir en aprender algo nuevo puede ser la inversión con mejor retorno a largo plazo.',
  'Automatizá el ahorro: configurá una transferencia automática al cobrar, antes de que lo veas disponible.',
]

const CAT_ICONS = {
  cenas: '🍽️', comida: '🍽️', transporte: '🚌', salud: '🏥', entretenimiento: '🎬',
  ropa: '👕', hogar: '🏠', educacion: '📚', viajes: '✈️',
  servicios: '⚡', sueldo: '💼', freelance: '💻', otro: '💰',
  suscripciones: '📱', mascotas: '🐾', supermercado: '🛒',
  prestamo_banco: '🏦', prestamo_coop: '🤝', tarjeta_credito: '💳',
}

const CAT_LABEL = {
  supermercado: 'Supermercado', cenas: 'Cenas', comida: 'Cenas', transporte: 'Transporte',
  salud: 'Salud', entretenimiento: 'Entretenimiento', ropa: 'Ropa',
  hogar: 'Hogar', educacion: 'Educación', viajes: 'Viajes', servicios: 'Servicios',
  suscripciones: 'Suscripciones', mascotas: 'Mascotas',
  prestamo_banco: 'Préstamo banco', prestamo_coop: 'Préstamo cooperativa',
  tarjeta_credito: 'Tarjeta de crédito', otro: 'Otro', sueldo: 'Sueldo', freelance: 'Freelance',
}

function getTip() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((new Date() - start) / 86400000)
  return TIPS[dayOfYear % TIPS.length]
}

function buildSparkPath(items) {
  const now = new Date()
  const vals = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return items
      .filter(t => {
        const td = new Date(t.fecha)
        return td.getDate() === d.getDate() && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
      })
      .reduce((s, t) => s + (t.tipo === 'ingreso' ? t.monto : -t.monto), 0)
  })
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const W = 115, H = 38
  const pts = vals.map((v, i) =>
    `${((i / 6) * W).toFixed(1)} ${(H - ((v - min) / range) * H * 0.8 - H * 0.05).toFixed(1)}`
  )
  return `M${pts.join(' L')}`
}

const SHADOW = '0 8px 22px -10px rgba(14,15,19,.18), 0 1px 2px rgba(14,15,19,.04)'
const BORDER = '1px solid rgba(14,15,19,.06)'

export default function Inicio() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const nombre = session?.user?.nombre || ''
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedMov, setSelectedMov] = useState(null)
  const [showBell, setShowBell] = useState(false)
  const [vencimientos, setVencimientos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flux_vencimientos') || '[]') } catch { return [] }
  })

  function saveVencimientos(list) {
    setVencimientos(list)
    localStorage.setItem('flux_vencimientos', JSON.stringify(list))
  }

  async function load() {
    if (!userId) return
    try { setItems((await movimientos.list(userId)) || []) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [userId])

  const now = new Date()

  const thisMonth = items.filter(t => {
    const d = new Date(t.fecha)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1)
  const lastMonth = items.filter(t => {
    const d = new Date(t.fecha)
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear()
  })

  const ingresos = thisMonth.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const gastos   = thisMonth.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const balance  = ingresos - gastos

  const balPasado =
    lastMonth.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0) -
    lastMonth.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const delta = balPasado !== 0
    ? Math.round((balance - balPasado) / Math.abs(balPasado) * 100)
    : null

  const sparkPath = items.length >= 2 ? buildSparkPath(items) : null
  const recientes = items.slice(0, 3)
  const urgentes = vencimientos.filter(v => !isPagado(v) && diasHastaFecha(proximaFecha(v)) <= 3)

  const grupos = {}
  items.forEach(t => {
    const key = new Date(t.fecha).toLocaleDateString('es', { day: 'numeric', month: 'long' })
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(t)
  })

  async function handleDelete(id) {
    await movimientos.delete(id)
    setSelectedMov(null)
    load()
  }

  const mesNombre = now.toLocaleDateString('es', { month: 'long' })
  const inicial = (nombre[0] || 'U').toUpperCase()

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#E7E8EE' }}>

      {/* Top bar */}
      <div className="max-w-md mx-auto flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-[42px] h-[42px] rounded-[14px] bg-flux-ink text-white grid place-items-center font-bold text-sm">
            {inicial}
          </div>
          <div>
            <p className="text-xs font-semibold text-flux-gray">Buenas, {nombre.split(' ')[0] || 'usuario'}</p>
            <p className="text-[17px] font-extrabold text-flux-ink" style={{ letterSpacing: '-.4px' }}>Tu dinero hoy</p>
          </div>
        </div>
        <button
          onClick={() => setShowBell(true)}
          className="relative w-[42px] h-[42px] rounded-[14px] bg-white grid place-items-center text-flux-ink-2 active:scale-95 transition-transform"
          style={{ boxShadow: SHADOW }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          {vencimientos.filter(v => !isPagado(v)).length > 0 && (
            <span
              className="absolute -top-1 -right-1 w-[17px] h-[17px] rounded-full text-white grid place-items-center font-extrabold"
              style={{ fontSize: 9, background: '#E5484D' }}
            >
              {vencimientos.filter(v => !isPagado(v)).length}
            </span>
          )}
        </button>
      </div>

      {/* Bento grid */}
      <div className="max-w-md mx-auto px-4 grid grid-cols-2 gap-[13px]">

        {/* Hero balance */}
        <div
          className="col-span-2 rounded-[26px] p-6 text-white relative overflow-hidden"
          style={{
            background: balance < 0
              ? 'linear-gradient(135deg, #E5484D 0%, #d43a3f 45%, #c03060 100%)'
              : 'linear-gradient(135deg, #0CAE73 0%, #0AA079 45%, #0E93A6 100%)',
            boxShadow: balance < 0
              ? '0 18px 36px -16px rgba(200,50,60,.6)'
              : '0 18px 36px -16px rgba(12,150,120,.7)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,.22), transparent 55%)' }}
          />
          <p className="text-[12.5px] font-semibold" style={{ color: 'rgba(255,255,255,.82)', letterSpacing: '.2px' }}>
            Balance de {mesNombre}
          </p>
          <p className="mt-2 tabular-nums leading-none" style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-1.8px' }}>
            <span style={{ fontSize: 16, fontWeight: 700, opacity: .7, verticalAlign: '5px', marginRight: 4 }}>
              {balance < 0 ? '− Gs.' : 'Gs.'}
            </span>
            {Math.abs(balance).toLocaleString('es')}
          </p>
          {delta !== null && delta !== 0 && (
            <div
              className="inline-flex items-center gap-[5px] mt-3 text-xs font-bold px-[11px] py-[5px] rounded-full"
              style={{ background: 'rgba(255,255,255,.18)' }}
            >
              {delta > 0
                ? <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7l10 10M17 7v8H9" /></svg>
              }
              {Math.abs(delta)}% {delta > 0 ? 'más' : 'menos'} que el mes pasado
            </div>
          )}
          {sparkPath && (
            <svg
              className="absolute right-[18px] bottom-4"
              width="115" height="42" viewBox="0 0 115 42"
              fill="none" preserveAspectRatio="none"
              style={{ opacity: .85 }}
            >
              <path d={sparkPath} stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
          <div className="flex items-center gap-2 text-xs font-semibold text-flux-gray">
            <span className="w-[26px] h-[26px] rounded-[8px] grid place-items-center flex-shrink-0 bg-flux-accent-soft text-flux-accent-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
            Ingresos
          </div>
          <p className="text-[22px] font-extrabold mt-[13px] tabular-nums" style={{ letterSpacing: '-.6px' }}>
            Gs. {ingresos.toLocaleString('es')}
          </p>
          <p className="text-[11.5px] font-semibold mt-1" style={{ color: '#B0B2BB' }}>Este mes</p>
        </div>

        {/* Gastos */}
        <div className="bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
          <div className="flex items-center gap-2 text-xs font-semibold text-flux-gray">
            <span className="w-[26px] h-[26px] rounded-[8px] grid place-items-center flex-shrink-0 bg-flux-fill text-flux-ink-2">
              <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7l10 10M17 7v8H9" />
              </svg>
            </span>
            Gastos
          </div>
          <p className="text-[22px] font-extrabold mt-[13px] tabular-nums" style={{ letterSpacing: '-.6px' }}>
            Gs. {gastos.toLocaleString('es')}
          </p>
          <p className="text-[11.5px] font-semibold mt-1" style={{ color: '#B0B2BB' }}>Este mes</p>
        </div>

        {/* Banner vencimientos urgentes */}
        {urgentes.length > 0 && (
          <button
            onClick={() => setShowBell(true)}
            className="col-span-2 rounded-[20px] p-[14px] flex items-center gap-3 active:scale-[0.99] transition-transform text-left w-full"
            style={{ background: 'linear-gradient(135deg,#FFF0F0,#FFF8F8)', border: '1px solid rgba(229,72,77,.2)', boxShadow: '0 4px 14px -6px rgba(229,72,77,.22)' }}
          >
            <div className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-shrink-0" style={{ background: '#E5484D', color: '#fff' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-extrabold" style={{ color: '#C93A3E' }}>
                {urgentes.length === 1 ? '1 cuenta vence pronto' : `${urgentes.length} cuentas vencen pronto`}
              </p>
              <p className="text-[11.5px] font-semibold mt-[1px] truncate" style={{ color: '#B0B2BB' }}>
                {urgentes[0].nombre}{urgentes.length > 1 ? ` y ${urgentes.length - 1} más` : ''} · Tocá para ver
              </p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="#E5484D" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}

        {/* Movimientos recientes */}
        <div
          className="col-span-2 bg-white rounded-[22px] overflow-hidden"
          style={{ boxShadow: SHADOW, border: BORDER, padding: '6px 6px 8px' }}
        >
          <div className="flex items-center justify-between px-[11px] pt-[11px] pb-2">
            <b className="text-[14px] font-extrabold" style={{ letterSpacing: '-.2px' }}>Movimientos recientes</b>
            <button onClick={() => setShowAll(true)} className="text-[12.5px] font-bold text-flux-accent-ink">
              Ver todos →
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 rounded-full border-2 border-flux-ink border-t-transparent animate-spin" />
            </div>
          ) : recientes.length === 0 ? (
            <p className="text-center text-sm text-flux-gray py-5 pb-4">Sin movimientos aún</p>
          ) : (
            recientes.map((t, i) => <MovRow key={t.id} t={t} showBorder={i > 0} />)
          )}
        </div>

        {/* Tip del día */}
        <div
          className="col-span-2 rounded-[22px] p-[19px] flex gap-[13px] items-start"
          style={{ background: 'linear-gradient(135deg, #FFF8EC, #FFFFFF)', boxShadow: SHADOW, border: BORDER }}
        >
          <div
            className="w-[42px] h-[42px] rounded-[12px] grid place-items-center flex-shrink-0"
            style={{ background: '#FBEED2', color: '#D98500' }}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 22h4" />
              <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: '#C77D00' }}>Tip del día</p>
            <p className="text-[13.5px] font-semibold leading-[1.45] mt-[5px]" style={{ color: '#42434A' }}>{getTip()}</p>
          </div>
        </div>

      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed right-[18px] z-[100] grid place-items-center"
        style={{
          bottom: 'calc(72px + env(safe-area-inset-bottom) + 14px)',
          width: 56, height: 56, borderRadius: 18, border: 'none',
          background: 'linear-gradient(135deg, #0CAE73, #0E93A6)',
          color: '#fff',
          boxShadow: '0 16px 32px -10px rgba(12,150,120,.7)',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Modal nueva transacción */}
      {showForm && (
        <Modal title="Nueva transacción" onClose={() => setShowForm(false)}>
          <FormTransaccion
            userId={userId}
            onSave={() => { setShowForm(false); load() }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {/* Modal campana — vencimientos */}
      {showBell && (
        <Modal title="Cuentas por pagar" onClose={() => setShowBell(false)}>
          <VencimientosPanel
            vencimientos={vencimientos}
            onChange={saveVencimientos}
          />
        </Modal>
      )}

      {/* Sheet: todos los movimientos */}
      {showAll && (
        <Modal
          title={selectedMov ? selectedMov.nota_desc : 'Movimientos'}
          onClose={() => { if (selectedMov) setSelectedMov(null); else setShowAll(false) }}
        >
          {selectedMov ? (
            <MovDetail mov={selectedMov} onBack={() => setSelectedMov(null)} onDelete={handleDelete} onRefresh={load} />
          ) : Object.keys(grupos).length === 0 ? (
            <p className="text-center text-sm text-flux-gray py-8">Sin movimientos</p>
          ) : (
            Object.entries(grupos).map(([dia, txs]) => (
              <div key={dia} className="mb-[14px]">
                <p className="text-xs font-bold text-flux-gray px-1 pb-2 uppercase tracking-wider">{dia}</p>
                <div className="bg-white rounded-[18px] overflow-hidden p-1" style={{ boxShadow: SHADOW, border: BORDER }}>
                  {txs.map((t, i) => (
                    <button key={t.id} className="w-full text-left" onClick={() => setSelectedMov(t)}>
                      <MovRow t={t} showBorder={i > 0} />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </Modal>
      )}
    </div>
  )
}

function MovRow({ t, showBorder }) {
  const icon = CAT_ICONS[t.categoria] || '💰'
  const esGasto = t.tipo === 'gasto'
  const fecha = new Date(t.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short' })

  return (
    <div
      className="flex items-center gap-3 px-3 py-3"
      style={showBorder ? { borderTop: '1px solid rgba(14,15,19,.06)' } : {}}
    >
      <div className="w-[38px] h-[38px] rounded-[11px] grid place-items-center text-lg flex-shrink-0" style={{ background: '#F0F0F4' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold truncate" style={{ letterSpacing: '-.1px', color: '#0E0F13' }}>{t.nota_desc}</p>
        <p className="text-[11.5px] font-medium" style={{ color: '#888A93' }}>{CAT_LABEL[t.categoria] || t.categoria} · {fecha}</p>
      </div>
      <span
        className="text-[14.5px] font-extrabold flex-shrink-0 tabular-nums"
        style={{ letterSpacing: '-.3px', color: esGasto ? '#0E0F13' : '#0A8F60' }}
      >
        {esGasto ? '−' : '+'} Gs. {Math.abs(t.monto).toLocaleString('es')}
      </span>
    </div>
  )
}

function MovDetail({ mov, onBack, onDelete, onRefresh }) {
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await onDelete(mov.id)
  }

  if (editing) {
    return (
      <FormTransaccion
        userId={mov.usuario_id}
        movId={mov.id}
        inicial={mov}
        onSave={() => { onRefresh(); onBack() }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-flux-accent-ink text-sm font-bold mb-5">
        <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Volver
      </button>
      <div className="space-y-4 mb-6">
        {[
          ['Descripción', mov.nota_desc],
          ['Monto', `Gs. ${Math.abs(mov.monto).toLocaleString('es')}`],
          ['Tipo', mov.tipo === 'gasto' ? 'Gasto' : 'Ingreso'],
          ['Categoría', CAT_LABEL[mov.categoria] || mov.categoria],
          ['Fecha', new Date(mov.fecha).toLocaleDateString('es')],
          mov.nota ? ['Notas', mov.nota] : null,
        ].filter(Boolean).map(([l, v]) => (
          <div key={l} className="flex justify-between items-start gap-4">
            <span className="text-xs text-flux-gray flex-shrink-0">{l}</span>
            <span className="text-sm font-semibold capitalize text-right" style={{ color: '#0E0F13' }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <button
          onClick={() => setEditing(true)}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{ background: '#F0F0F4', color: '#0E0F13' }}
        >
          Editar movimiento
        </button>
        <button onClick={handleDelete} disabled={deleting} className="btn-danger">
          {deleting ? '...' : 'Eliminar movimiento'}
        </button>
      </div>
    </div>
  )
}

// ── Helpers vencimientos ──────────────────────────────────────────────────────
function proximaFecha(v) {
  if (v.tipo === 'cuotas') {
    const d = new Date(v.fecha_inicio)
    d.setMonth(d.getMonth() + (v.cuotas_pagadas || 0))
    return d.toISOString().slice(0, 10)
  }
  return v.fecha
}

function isPagado(v) {
  if (v.tipo === 'cuotas') return (v.cuotas_pagadas || 0) >= v.cuotas_totales
  return !!v.pagada
}

function diasHastaFecha(fechaStr) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  const f = new Date(fechaStr); f.setHours(0,0,0,0)
  return Math.round((f - hoy) / 86400000)
}

function pillStyle(dias, pagado) {
  if (pagado)     return { background: '#E6F6EF', color: '#0A8F60' }
  if (dias < 0)   return { background: '#FDEAEA', color: '#E5484D' }
  if (dias === 0) return { background: '#FDEAEA', color: '#E5484D' }
  if (dias <= 3)  return { background: '#FFF3DC', color: '#C77D00' }
  if (dias <= 7)  return { background: '#FFF8EC', color: '#E08600' }
  return { background: '#F0F0F4', color: '#888A93' }
}

function pillLabel(dias, pagado) {
  if (pagado)     return '✓ Completada'
  if (dias < 0)   return `Vencida hace ${Math.abs(dias)}d`
  if (dias === 0) return '¡Vence hoy!'
  if (dias === 1) return 'Vence mañana'
  return `${dias} días`
}

function avanzarFecha(fechaStr, repeticion) {
  const d = new Date(fechaStr)
  if (repeticion === 'mensual') d.setMonth(d.getMonth() + 1)
  else if (repeticion === 'anual') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

// ── Vencimientos (campana) ─────────────────────────────────────────────────────
function VencimientosPanel({ vencimientos, onChange }) {
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [showHistorial, setShowHistorial] = useState(false)

  function pagarCuota(id) {
    const v = vencimientos.find(x => x.id === id)
    if (!v) return
    if (v.tipo === 'cuotas') {
      onChange(vencimientos.map(x =>
        x.id === id ? { ...x, cuotas_pagadas: Math.min((x.cuotas_pagadas || 0) + 1, x.cuotas_totales) } : x
      ))
      return
    }
    // Pago único con repeticion → marcar pagado y crear el próximo
    if (v.repeticion) {
      const nueva = {
        ...v,
        id: String(Date.now()),
        fecha: avanzarFecha(v.fecha, v.repeticion),
        pagada: false,
      }
      onChange([...vencimientos.map(x => x.id === id ? { ...x, pagada: true } : x), nueva])
    } else {
      onChange(vencimientos.map(x => x.id === id ? { ...x, pagada: true } : x))
    }
  }

  function reactivar(id) {
    onChange(vencimientos.map(v => {
      if (v.id !== id) return v
      if (v.tipo === 'cuotas') return { ...v, cuotas_pagadas: Math.max(0, (v.cuotas_pagadas || 0) - 1) }
      return { ...v, pagada: false }
    }))
  }

  function eliminar(id) { onChange(vencimientos.filter(v => v.id !== id)) }

  function pinear(id) {
    onChange(vencimientos.map(v => v.id === id ? { ...v, pinned: !v.pinned } : v))
  }

  function guardarEdicion(datos) {
    onChange(vencimientos.map(v => v.id === editando.id ? { ...v, ...datos } : v))
    setEditando(null)
  }

  const pendientes = vencimientos
    .filter(v => !isPagado(v))
    .sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return a.pinned ? -1 : 1
      return new Date(proximaFecha(a)) - new Date(proximaFecha(b))
    })

  const historial = vencimientos
    .filter(v => isPagado(v))
    .sort((a, b) => new Date(proximaFecha(b)) - new Date(proximaFecha(a)))

  if (showForm) {
    return (
      <FormVencimiento
        onSave={v => { onChange([...vencimientos, { ...v, id: String(Date.now()) }]); setShowForm(false) }}
        onCancel={() => setShowForm(false)}
      />
    )
  }

  if (editando) {
    return (
      <FormVencimiento
        inicial={editando}
        onSave={guardarEdicion}
        onCancel={() => setEditando(null)}
      />
    )
  }

  return (
    <div>
      {!showHistorial ? (
        pendientes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-3">🎉</p>
            <p className="text-[14px] font-extrabold" style={{ color: '#0E0F13' }}>¡Todo al día!</p>
            <p className="text-[12.5px] font-semibold mt-1" style={{ color: '#888A93' }}>No tenés cuentas pendientes</p>
          </div>
        ) : (
          <div className="space-y-[9px] mb-4">
            {pendientes.map(v => (
              <VencCard key={v.id} v={v}
                onPagar={pagarCuota}
                onEliminar={eliminar}
                onEditar={setEditando}
                onPinear={pinear}
              />
            ))}
          </div>
        )
      ) : (
        <div className="mb-4">
          <p className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color: '#B0B2BB' }}>
            Cuentas completadas
          </p>
          {historial.length === 0 ? (
            <p className="text-center text-[13px] font-semibold py-6" style={{ color: '#888A93' }}>
              Aún no hay cuentas pagadas
            </p>
          ) : (
            <div className="space-y-[9px]">
              {historial.map(v => (
                <div key={v.id} className="flex items-center gap-3 rounded-[16px] p-[14px]" style={{ background: '#F8F8FA', border: BORDER }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-extrabold truncate" style={{ color: '#B0B2BB', letterSpacing: '-.1px', textDecoration: 'line-through' }}>
                      {v.nombre}
                    </p>
                    {v.tipo === 'cuotas' ? (
                      <p className="text-[11.5px] font-semibold mt-[2px]" style={{ color: '#B0B2BB' }}>
                        {v.cuotas_totales} cuotas{v.monto_cuota > 0 ? ` · Gs. ${v.monto_cuota.toLocaleString('es')}/cuota` : ''}
                      </p>
                    ) : v.monto > 0 ? (
                      <p className="text-[11.5px] font-semibold mt-[2px] tabular-nums" style={{ color: '#B0B2BB' }}>
                        Gs. {v.monto.toLocaleString('es')}
                      </p>
                    ) : null}
                    {v.notas ? <p className="text-[11px] font-medium mt-[2px] truncate" style={{ color: '#B0B2BB' }}>{v.notas}</p> : null}
                    {v.repeticion && (
                      <span className="inline-block text-[10px] font-bold px-[7px] py-[2px] rounded-full mt-[4px]" style={{ background: '#E6F6EF', color: '#0A8F60' }}>
                        ↺ {v.repeticion === 'mensual' ? 'Mensual' : 'Anual'} · nuevo creado
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <button onClick={() => reactivar(v.id)} className="w-[32px] h-[32px] rounded-[10px] grid place-items-center" style={{ background: '#F0F0F4', color: '#888A93' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                      </svg>
                    </button>
                    <button onClick={() => eliminar(v.id)} className="w-[32px] h-[32px] rounded-[10px] grid place-items-center" style={{ background: '#FDEAEA', color: '#E5484D' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-[8px]">
        {historial.length > 0 && (
          <button onClick={() => setShowHistorial(h => !h)} className="w-full py-3 rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform" style={{ background: '#F0F0F4', color: '#42434A' }}>
            {showHistorial ? '← Volver a pendientes' : `Historial · ${historial.length} completada${historial.length !== 1 ? 's' : ''}`}
          </button>
        )}
        {!showHistorial && (
          <button onClick={() => setShowForm(true)} className="w-full py-3.5 rounded-xl font-bold text-sm active:scale-[0.97] transition-transform flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#0CAE73,#0E93A6)', color: '#fff' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Agregar cuenta
          </button>
        )}
      </div>
    </div>
  )
}

// ── Tarjeta individual de vencimiento ─────────────────────────────────────────
function VencCard({ v, onPagar, onEliminar, onEditar, onPinear }) {
  const proxFecha = proximaFecha(v)
  const dias = diasHastaFecha(proxFecha)
  const pill = pillStyle(dias, false)
  const label = pillLabel(dias, false)
  const fechaFmt = new Date(proxFecha).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
  const pct = v.tipo === 'cuotas' ? Math.round(((v.cuotas_pagadas || 0) / v.cuotas_totales) * 100) : null
  const atrasada = v.tipo === 'cuotas' && dias < 0

  return (
    <div className="rounded-[16px] p-[14px]" style={{ background: '#fff', border: atrasada ? '1px solid rgba(229,72,77,.25)' : BORDER, boxShadow: SHADOW }}>
      {/* Header row */}
      <div className="flex items-start gap-2">
        {/* Pin */}
        <button onClick={() => onPinear(v.id)} className="mt-[2px] flex-shrink-0" style={{ color: v.pinned ? '#E08600' : '#D0D2DB' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={v.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-extrabold truncate" style={{ color: '#0E0F13', letterSpacing: '-.1px' }}>{v.nombre}</p>
          <div className="flex items-center gap-2 mt-[4px] flex-wrap">
            <span className="text-[11px] font-bold px-[8px] py-[3px] rounded-full" style={pill}>{label}</span>
            <span className="text-[11px] font-semibold" style={{ color: '#B0B2BB' }}>{fechaFmt}</span>
            {v.repeticion && (
              <span className="text-[10px] font-bold px-[7px] py-[2px] rounded-full" style={{ background: '#E6F6EF', color: '#0A8F60' }}>
                ↺ {v.repeticion === 'mensual' ? 'Mensual' : 'Anual'}
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-[5px] flex-shrink-0">
          <button onClick={() => onEditar(v)} className="w-[30px] h-[30px] rounded-[9px] grid place-items-center" style={{ background: '#F0F0F4', color: '#42434A' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onClick={() => onPagar(v.id)} className="w-[30px] h-[30px] rounded-[9px] grid place-items-center" style={{ background: '#E6F6EF', color: '#0A8F60' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </button>
          <button onClick={() => onEliminar(v.id)} className="w-[30px] h-[30px] rounded-[9px] grid place-items-center" style={{ background: '#FDEAEA', color: '#E5484D' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      {v.tipo === 'cuotas' ? (
        <div className="mt-[10px]">
          {atrasada && (
            <p className="text-[11px] font-bold mb-[6px] px-[8px] py-[3px] rounded-[7px] inline-block" style={{ background: '#FDEAEA', color: '#E5484D' }}>
              ⚠ Cuota atrasada — ¿ya pagaste?
            </p>
          )}
          <div className="flex items-center justify-between mb-[5px]">
            <span className="text-[11.5px] font-semibold" style={{ color: '#888A93' }}>
              {v.cuotas_pagadas || 0}/{v.cuotas_totales} cuotas pagadas
            </span>
            <span className="text-[11.5px] font-extrabold tabular-nums" style={{ color: '#0A8F60' }}>{pct}%</span>
          </div>
          <div className="w-full h-[5px] rounded-full overflow-hidden mb-[6px]" style={{ background: '#F0F0F4' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#0CAE73,#0A8F60)' }} />
          </div>
          {v.monto_cuota > 0 && (
            <p className="text-[12px] font-bold tabular-nums" style={{ color: '#42434A' }}>
              Gs. {v.monto_cuota.toLocaleString('es')}/cuota
              <span className="font-semibold" style={{ color: '#B0B2BB' }}>
                {' · '}Total Gs. {(v.monto_cuota * v.cuotas_totales).toLocaleString('es')}
              </span>
            </p>
          )}
        </div>
      ) : v.monto > 0 ? (
        <p className="text-[13px] font-bold mt-[8px] tabular-nums" style={{ color: '#42434A' }}>
          Gs. {v.monto.toLocaleString('es')}
        </p>
      ) : null}

      {v.notas ? (
        <p className="text-[11.5px] font-medium mt-[8px] leading-[1.4]" style={{ color: '#888A93' }}>{v.notas}</p>
      ) : null}
    </div>
  )
}

// ── Formulario agregar / editar cuenta ────────────────────────────────────────
function FormVencimiento({ inicial, onSave, onCancel }) {
  const esEdicion = !!inicial
  const [tipo, setTipo] = useState(inicial?.tipo || 'unico')
  const [nombre, setNombre] = useState(inicial?.nombre || '')
  const [monto, setMonto] = useState(inicial?.monto ? String(inicial.monto) : '')
  const [fecha, setFecha] = useState(inicial?.fecha || '')
  const [montoCuota, setMontoCuota] = useState(inicial?.monto_cuota ? String(inicial.monto_cuota) : '')
  const [cuotasTotales, setCuotasTotales] = useState(inicial?.cuotas_totales ? String(inicial.cuotas_totales) : '')
  const [fechaInicio, setFechaInicio] = useState(inicial?.fecha_inicio || '')
  const [notas, setNotas] = useState(inicial?.notas || '')
  const [repeticion, setRepeticion] = useState(inicial?.repeticion || 'ninguna')

  function handleSubmit(e) {
    e.preventDefault()
    const rep = repeticion === 'ninguna' ? null : repeticion
    if (tipo === 'unico') {
      if (!nombre || !fecha) return
      onSave({ tipo: 'unico', nombre, monto: monto ? Number(monto) : 0, fecha, pagada: false, notas: notas || null, repeticion: rep })
    } else {
      if (!nombre || !fechaInicio || !cuotasTotales) return
      onSave({
        tipo: 'cuotas', nombre,
        monto_cuota: montoCuota ? Number(montoCuota) : 0,
        cuotas_totales: Number(cuotasTotales),
        cuotas_pagadas: inicial?.cuotas_pagadas || 0,
        fecha_inicio: fechaInicio,
        notas: notas || null,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-xl border border-flux-border p-1 gap-1">
        {[['unico','Pago único'], ['cuotas','En cuotas']].map(([t, l]) => (
          <button key={t} type="button" onClick={() => setTipo(t)}
            className="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
            style={tipo === t ? { background: '#0CAE73', color: '#fff' } : { color: '#888A93' }}
          >{l}</button>
        ))}
      </div>

      <div>
        <label className="label">Nombre</label>
        <input required value={nombre} onChange={e => setNombre(e.target.value)}
          placeholder="Ej: Luz, Netflix, Cuota BBVA..." className="input-field" />
      </div>

      {tipo === 'unico' ? (
        <>
          <div>
            <label className="label">Monto (opcional)</label>
            <input type="number" min="0" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0" className="input-field" />
          </div>
          <div>
            <label className="label">Fecha de vencimiento</label>
            <input required type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Repetición</label>
            <div className="flex gap-2 mt-2">
              {[['ninguna','Sin repetir'], ['mensual','Mensual'], ['anual','Anual']].map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => setRepeticion(val)}
                  className="flex-1 py-2 text-xs font-bold rounded-lg border transition-all"
                  style={repeticion === val
                    ? { background: '#0CAE73', color: '#fff', border: '1px solid #0CAE73' }
                    : { color: '#888A93', border: '1px solid #e5e5e5' }
                  }
                >{lbl}</button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="label">Monto por cuota (opcional)</label>
            <input type="number" min="0" value={montoCuota} onChange={e => setMontoCuota(e.target.value)} placeholder="0" className="input-field" />
          </div>
          <div>
            <label className="label">Cantidad de cuotas</label>
            <input required type="number" min="1" max="360" value={cuotasTotales} onChange={e => setCuotasTotales(e.target.value)} placeholder="Ej: 12" className="input-field" />
          </div>
          <div>
            <label className="label">Fecha de la primera cuota</label>
            <input required type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="input-field" />
          </div>
        </>
      )}

      <div>
        <label className="label">Notas (opcional)</label>
        <input value={notas} onChange={e => setNotas(e.target.value)}
          placeholder="Entidad, nro de cuenta, referencia..." className="input-field" />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" className="btn-primary flex-1">{esEdicion ? 'Guardar cambios' : 'Agregar'}</button>
      </div>
    </form>
  )
}
