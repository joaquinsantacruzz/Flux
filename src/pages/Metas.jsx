import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { metas } from '../supabaseClient'
import Modal from '../components/Modal'

const SHADOW = '0 8px 22px -10px rgba(14,15,19,.18), 0 1px 2px rgba(14,15,19,.04)'
const BORDER = '1px solid rgba(14,15,19,.06)'

export default function Metas() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ubicaciones, setUbicaciones] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flux_meta_ubicaciones') || '{}') } catch { return {} }
  })

  function saveUbicacion(metaId, valor) {
    const next = { ...ubicaciones, [metaId]: valor }
    setUbicaciones(next)
    localStorage.setItem('flux_meta_ubicaciones', JSON.stringify(next))
  }

  async function load() {
    if (!userId) return
    try { setItems((await metas.list(userId)) || []) } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [userId])

  const totalAhorrado  = items.reduce((s, m) => s + m.monto_actual, 0)
  const totalObjetivo  = items.reduce((s, m) => s + m.monto_objetivo, 0)
  const completadas    = items.filter(m => m.monto_actual >= m.monto_objetivo).length

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#E7E8EE' }}>

      {/* Header */}
      <div className="max-w-md mx-auto px-4 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold" style={{ letterSpacing: '-.5px' }}>Metas</h1>
          {items.length > 0 && (
            <p className="text-[12px] font-semibold" style={{ color: '#888A93' }}>
              {completadas} de {items.length} completada{items.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-[6px] px-4 py-[9px] rounded-[12px] text-white text-[13px] font-bold active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #0CAE73, #0E93A6)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nueva
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center pt-16">
          <div className="w-6 h-6 rounded-full border-2 border-flux-black border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="max-w-md mx-auto px-4 grid grid-cols-2 gap-[13px]">

          {/* Resumen — solo si hay más de 1 meta */}
          {items.length > 1 && (
            <>
              <div className="bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
                <p className="text-[11.5px] font-semibold mb-1" style={{ color: '#888A93' }}>Total ahorrado</p>
                <p className="text-[20px] font-extrabold tabular-nums" style={{ letterSpacing: '-.6px', color: '#0A8F60' }}>
                  Gs. {totalAhorrado.toLocaleString('es')}
                </p>
              </div>
              <div className="bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
                <p className="text-[11.5px] font-semibold mb-1" style={{ color: '#888A93' }}>Objetivo total</p>
                <p className="text-[20px] font-extrabold tabular-nums" style={{ letterSpacing: '-.6px', color: '#0E0F13' }}>
                  Gs. {totalObjetivo.toLocaleString('es')}
                </p>
              </div>
            </>
          )}

          {/* Cards de metas */}
          {items.length === 0 ? (
            <div className="col-span-2 bg-white rounded-[24px] p-8 text-center" style={{ boxShadow: SHADOW, border: BORDER }}>
              <p className="text-4xl mb-3">🎯</p>
              <p className="text-[15px] font-extrabold" style={{ color: '#0E0F13' }}>Sin metas todavía</p>
              <p className="text-[12.5px] font-semibold mt-1" style={{ color: '#888A93' }}>
                Tocá <b style={{ color: '#0A8F60' }}>+ Nueva</b> para empezar a ahorrar
              </p>
            </div>
          ) : (
            items.map(m => <MetaCard key={m.id} m={m} ubicacion={ubicaciones[m.id] || ''} onClick={() => setSelected(m)} />)
          )}

        </div>
      )}

      {showForm && (
        <Modal title="Nueva meta" onClose={() => setShowForm(false)}>
          <FormMeta userId={userId} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {selected && (
        <Modal title={selected.nombre} onClose={() => setSelected(null)}>
          <AbonarMeta
            meta={selected}
            ubicacion={ubicaciones[selected.id] || ''}
            onUbicacionChange={v => saveUbicacion(selected.id, v)}
            onSave={() => { setSelected(null); load() }}
            onDelete={async () => { await metas.delete(selected.id); setSelected(null); load() }}
          />
        </Modal>
      )}
    </div>
  )
}

function MetaCard({ m, ubicacion, onClick }) {
  const pct = Math.min(100, Math.round((m.monto_actual / m.monto_objetivo) * 100))
  const falta = Math.max(0, m.monto_objetivo - m.monto_actual)
  const done = pct >= 100

  return (
    <button
      onClick={onClick}
      className="col-span-2 bg-white rounded-[24px] p-5 text-left active:scale-[0.99] transition-transform w-full"
      style={{ boxShadow: SHADOW, border: BORDER }}
    >
      {/* Nombre + badge completada */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-extrabold truncate" style={{ letterSpacing: '-.2px', color: '#0E0F13' }}>{m.nombre}</p>
          {m.descripcion && (
            <p className="text-[12px] font-semibold mt-[2px] truncate" style={{ color: '#888A93' }}>{m.descripcion}</p>
          )}
        </div>
        {done ? (
          <span className="flex-shrink-0 text-[11px] font-bold px-[10px] py-[4px] rounded-full" style={{ background: '#E6F6EF', color: '#0A8F60' }}>
            ✓ Lista
          </span>
        ) : (
          <span className="flex-shrink-0 text-[13px] font-extrabold tabular-nums" style={{ color: '#0A8F60' }}>
            {pct}%
          </span>
        )}
      </div>

      {/* Montos */}
      <div className="flex items-baseline gap-[6px] mt-[12px]">
        <span className="text-[22px] font-extrabold tabular-nums" style={{ letterSpacing: '-.6px', color: '#0E0F13' }}>
          Gs. {m.monto_actual.toLocaleString('es')}
        </span>
        <span className="text-[13px] font-semibold" style={{ color: '#B0B2BB' }}>
          / Gs. {m.monto_objetivo.toLocaleString('es')}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="mt-[12px] w-full h-[6px] rounded-full overflow-hidden" style={{ background: '#F0F0F4' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: done ? '#0CAE73' : 'linear-gradient(90deg, #0CAE73, #0A8F60)',
          }}
        />
      </div>

      {/* Footer */}
      <p className="text-[11.5px] font-semibold mt-[8px]" style={{ color: '#888A93' }}>
        {done
          ? '¡Meta alcanzada! 🎉'
          : `Quedan Gs. ${falta.toLocaleString('es')}${m.fecha_limite ? ` · Hasta ${new Date(m.fecha_limite).toLocaleDateString('es')}` : ''}`
        }
      </p>
      {ubicacion && (
        <div className="flex items-center gap-[6px] mt-[8px]">
          <svg width="11" height="11" viewBox="0 0 24 24" stroke="#0A8F60" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="text-[11px] font-bold truncate" style={{ color: '#0A8F60' }}>{ubicacion}</span>
        </div>
      )}
    </button>
  )
}

function FormMeta({ userId, onSave, onCancel }) {
  const [nombre, setNombre] = useState('')
  const [montoObjetivo, setMontoObjetivo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await metas.create({
        usuario_id: userId,
        nombre,
        monto_objetivo: Number(montoObjetivo),
        monto_actual: 0,
        descripcion: descripcion || null,
        fecha_limite: fechaLimite || null,
      })
      onSave()
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nombre</label>
        <input required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Viaje a Europa" className="input-field" />
      </div>
      <div>
        <label className="label">Objetivo (Gs.)</label>
        <input required type="number" min="1" value={montoObjetivo} onChange={e => setMontoObjetivo(e.target.value)} placeholder="0" className="input-field" />
      </div>
      <div>
        <label className="label">Descripción (opcional)</label>
        <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="¿Para qué es esta meta?" className="input-field" />
      </div>
      <div>
        <label className="label">Fecha límite (opcional)</label>
        <input type="date" value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} className="input-field" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? '...' : 'Guardar'}</button>
      </div>
    </form>
  )
}

function AbonarMeta({ meta, ubicacion, onUbicacionChange, onSave, onDelete }) {
  const pct = Math.min(100, Math.round((meta.monto_actual / meta.monto_objetivo) * 100))
  const [abono, setAbono] = useState('')
  const [editUbicacion, setEditUbicacion] = useState(false)
  const [ubicacionDraft, setUbicacionDraft] = useState(ubicacion)
  const [loading, setLoading] = useState(false)

  async function handleAbono(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await metas.update(meta.id, { monto_actual: meta.monto_actual + Number(abono) })
      onSave()
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div>
      {/* Progreso visual */}
      <div className="rounded-[18px] p-4 mb-4" style={{ background: '#F0F0F4' }}>
        <div className="flex justify-between mb-2">
          <span className="text-[12px] font-semibold" style={{ color: '#888A93' }}>Progreso</span>
          <span className="text-[13px] font-extrabold" style={{ color: '#0A8F60' }}>{pct}%</span>
        </div>
        <div className="w-full h-[8px] rounded-full overflow-hidden" style={{ background: '#E0E0E6' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0CAE73, #0A8F60)' }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[11.5px] font-bold tabular-nums" style={{ color: '#0E0F13' }}>
            Gs. {meta.monto_actual.toLocaleString('es')} ahorrado
          </span>
          <span className="text-[11.5px] font-semibold tabular-nums" style={{ color: '#B0B2BB' }}>
            meta Gs. {meta.monto_objetivo.toLocaleString('es')}
          </span>
        </div>
      </div>

      {/* Ubicación del dinero */}
      <div className="rounded-[16px] p-[14px] mb-4" style={{ background: '#fff', border: '1px solid rgba(14,15,19,.06)', boxShadow: '0 4px 12px -6px rgba(14,15,19,.1)' }}>
        <div className="flex items-center justify-between mb-[6px]">
          <p className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: '#888A93' }}>¿Dónde tenés el dinero?</p>
          <button type="button" onClick={() => setEditUbicacion(e => !e)} className="text-[11px] font-bold" style={{ color: '#0A8F60' }}>
            {editUbicacion ? 'Listo' : (ubicacion ? 'Editar' : '+ Agregar')}
          </button>
        </div>
        {editUbicacion ? (
          <div className="flex gap-2">
            <input
              value={ubicacionDraft}
              onChange={e => setUbicacionDraft(e.target.value)}
              placeholder="Ej: Caja de ahorro BCP, alcancía, efectivo..."
              className="input-field flex-1 text-[13px]"
              autoFocus
            />
            <button
              type="button"
              onClick={() => { onUbicacionChange(ubicacionDraft); setEditUbicacion(false) }}
              className="px-3 py-1 rounded-lg text-[12px] font-bold text-white"
              style={{ background: '#0CAE73' }}
            >
              OK
            </button>
          </div>
        ) : ubicacion ? (
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" stroke="#0A8F60" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <p className="text-[13px] font-bold" style={{ color: '#0E0F13' }}>{ubicacion}</p>
          </div>
        ) : (
          <p className="text-[12.5px] font-semibold" style={{ color: '#B0B2BB' }}>Sin especificar</p>
        )}
      </div>

      <form onSubmit={handleAbono} className="space-y-3 mb-4">
        <div>
          <label className="label">Abonar monto (Gs.)</label>
          <input required type="number" min="1" value={abono} onChange={e => setAbono(e.target.value)} placeholder="0" className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '...' : 'Abonar'}
        </button>
      </form>

      <button onClick={onDelete} className="btn-danger">Eliminar meta</button>
    </div>
  )
}
