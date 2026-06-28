import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { deudas, cuotas } from '../supabaseClient'
import Modal from '../components/Modal'

const SHADOW = '0 8px 22px -10px rgba(14,15,19,.18), 0 1px 2px rgba(14,15,19,.04)'
const BORDER = '1px solid rgba(14,15,19,.06)'

export default function Deudas() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [items, setItems] = useState([])
  const [cuotasList, setCuotasList] = useState([])
  const [tab, setTab] = useState('deudas')
  const [filtroDeudas, setFiltroDeudas] = useState('todas')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!userId) return
    try {
      const [d, c] = await Promise.all([deudas.list(userId), cuotas.list(userId)])
      setItems(d || [])
      setCuotasList(c || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [userId])

  const deudosFiltradas = items.filter(d => {
    if (filtroDeudas === 'saldadas') return d.saldada
    if (filtroDeudas === 'todas') return !d.saldada
    return !d.saldada && d.tipo === filtroDeudas
  })

  const totalMeDeben = items.filter(d => !d.saldada && d.tipo === 'me_deben').reduce((s, d) => s + d.monto, 0)
  const totalLesDebo = items.filter(d => !d.saldada && d.tipo === 'les_debo').reduce((s, d) => s + d.monto, 0)
  const totalCuotas  = cuotasList.filter(c => c.activa).reduce((s, c) => s + c.monto_cuota, 0)

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#E7E8EE' }}>

      {/* Header */}
      <div className="max-w-md mx-auto px-4 pt-5 pb-4 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold" style={{ letterSpacing: '-.5px' }}>Deudas</h1>
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

      <div className="max-w-md mx-auto px-4 space-y-[13px]">

        {/* Resumen */}
        <div className="grid grid-cols-2 gap-[13px]">
          <div className="bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
            <div className="w-[30px] h-[30px] rounded-[9px] grid place-items-center mb-3" style={{ background: '#E6F6EF' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" stroke="#0A8F60" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <p className="text-[11.5px] font-semibold" style={{ color: '#888A93' }}>Me deben</p>
            <p className="text-[20px] font-extrabold mt-1 tabular-nums" style={{ letterSpacing: '-.6px', color: '#0A8F60' }}>
              Gs. {totalMeDeben.toLocaleString('es')}
            </p>
          </div>
          <div className="bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
            <div className="w-[30px] h-[30px] rounded-[9px] grid place-items-center mb-3" style={{ background: '#FDEAEA' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" stroke="#E5484D" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <p className="text-[11.5px] font-semibold" style={{ color: '#888A93' }}>Yo debo</p>
            <p className="text-[20px] font-extrabold mt-1 tabular-nums" style={{ letterSpacing: '-.6px', color: '#0E0F13' }}>
              Gs. {totalLesDebo.toLocaleString('es')}
            </p>
          </div>
        </div>

        {/* Tabs Deudas / Cuotas */}
        <div className="flex gap-1 p-1 rounded-[12px]" style={{ background: 'rgba(14,15,19,.08)' }}>
          {[['deudas','Deudas'], ['cuotas',`Cuotas · Gs. ${totalCuotas.toLocaleString('es')}/mes`]].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setTab(val)}
              className="flex-1 py-[7px] rounded-[9px] text-[12px] font-bold transition-all"
              style={tab === val
                ? { background: '#fff', color: '#0E0F13', boxShadow: '0 1px 4px rgba(14,15,19,.12)' }
                : { color: '#888A93' }
              }
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Filtros de deudas */}
        {tab === 'deudas' && (
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {[['todas','Todas'], ['me_deben','Me deben'], ['les_debo','Yo debo'], ['saldadas','Saldadas']].map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setFiltroDeudas(val)}
                className="px-4 py-[7px] rounded-full text-[12px] font-bold whitespace-nowrap flex-shrink-0 transition-all"
                style={filtroDeudas === val
                  ? { background: '#0E0F13', color: '#fff' }
                  : { background: 'rgba(14,15,19,.08)', color: '#888A93' }
                }
              >
                {lbl}
              </button>
            ))}
          </div>
        )}

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-flux-black border-t-transparent animate-spin" />
          </div>
        ) : tab === 'deudas' ? (
          deudosFiltradas.length === 0 ? (
            <EmptyCard icon="✅" title="Sin deudas pendientes" sub="¡Todo al día!" />
          ) : (
            <div className="space-y-[10px]">
              {deudosFiltradas.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelected({ _tipo: 'deuda', ...d })}
                  className="w-full bg-white rounded-[20px] p-4 text-left active:scale-[0.99] transition-transform"
                  style={{ boxShadow: SHADOW, border: BORDER }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-[5px]">
                        <span
                          className="text-[11px] font-bold px-[9px] py-[3px] rounded-full"
                          style={d.tipo === 'me_deben'
                            ? { background: '#E6F6EF', color: '#0A8F60' }
                            : { background: '#FDEAEA', color: '#E5484D' }
                          }
                        >
                          {d.tipo === 'me_deben' ? 'Me deben' : 'Yo debo'}
                        </span>
                        {d.saldada && (
                          <span className="text-[11px] font-semibold" style={{ color: '#B0B2BB' }}>· Saldada</span>
                        )}
                      </div>
                      <p className="text-[14px] font-extrabold truncate" style={{ color: '#0E0F13', letterSpacing: '-.1px' }}>
                        {d.descripcion || d.persona}
                      </p>
                      <p className="text-[11.5px] font-semibold mt-[2px]" style={{ color: '#888A93' }}>
                        {d.persona}{d.fecha ? ` · ${new Date(d.fecha).toLocaleDateString('es')}` : ''}
                      </p>
                    </div>
                    <p
                      className="text-[17px] font-extrabold tabular-nums flex-shrink-0"
                      style={{ color: d.tipo === 'me_deben' ? '#0A8F60' : '#0E0F13', letterSpacing: '-.4px' }}
                    >
                      Gs. {d.monto.toLocaleString('es')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          cuotasList.length === 0 ? (
            <EmptyCard icon="📋" title="Sin cuotas" sub="Agregá una compra en cuotas" />
          ) : (
            <div className="space-y-[10px]">
              {cuotasList.map(c => {
                const pct = Math.min(100, Math.round((c.cuotas_pagadas / c.cuotas_totales) * 100))
                const restante = (c.cuotas_totales - c.cuotas_pagadas) * c.monto_cuota
                const done = pct >= 100
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected({ _tipo: 'cuota', ...c })}
                    className="w-full bg-white rounded-[20px] p-4 text-left active:scale-[0.99] transition-transform"
                    style={{ boxShadow: SHADOW, border: BORDER }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-extrabold truncate" style={{ color: '#0E0F13', letterSpacing: '-.1px' }}>{c.descripcion}</p>
                        <p className="text-[11.5px] font-semibold mt-[2px]" style={{ color: '#888A93' }}>
                          {c.cuotas_pagadas}/{c.cuotas_totales} cuotas · Gs. {c.monto_cuota.toLocaleString('es')}/cuota
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[16px] font-extrabold tabular-nums" style={{ color: '#0E0F13', letterSpacing: '-.4px' }}>
                          Gs. {restante.toLocaleString('es')}
                        </p>
                        <p className="text-[11px] font-semibold" style={{ color: '#B0B2BB' }}>restante</p>
                      </div>
                    </div>
                    <div className="w-full h-[5px] rounded-full overflow-hidden" style={{ background: '#F0F0F4' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: done ? '#0CAE73' : 'linear-gradient(90deg, #0CAE73, #0A8F60)' }}
                      />
                    </div>
                    <p className="text-[11px] font-semibold mt-[6px]" style={{ color: '#B0B2BB' }}>
                      {done ? '✓ Completada' : `${pct}% pagado`}
                    </p>
                  </button>
                )
              })}
            </div>
          )
        )}
      </div>

      {showForm && (
        <Modal title="Agregar" onClose={() => setShowForm(false)}>
          <FormDeudaCuota userId={userId} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {selected && (
        <Modal title={selected.descripcion || selected.persona || 'Detalle'} onClose={() => setSelected(null)}>
          {selected._tipo === 'deuda'
            ? <DetalleDeuda item={selected} onClose={() => setSelected(null)} onRefresh={load} />
            : <DetalleCuota item={selected} onClose={() => setSelected(null)} onRefresh={load} />
          }
        </Modal>
      )}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyCard({ icon, title, sub }) {
  return (
    <div className="bg-white rounded-[22px] p-8 text-center" style={{ boxShadow: SHADOW, border: BORDER }}>
      <p className="text-4xl mb-3">{icon}</p>
      <p className="text-[14px] font-extrabold" style={{ color: '#0E0F13' }}>{title}</p>
      <p className="text-[12px] font-semibold mt-1" style={{ color: '#888A93' }}>{sub}</p>
    </div>
  )
}

// ── Detalle deuda ──────────────────────────────────────────────────────────────
function DetalleDeuda({ item, onClose, onRefresh }) {
  const [saving, setSaving] = useState(false)

  async function toggleSaldada() {
    setSaving(true)
    try { await deudas.update(item.id, { saldada: !item.saldada }); onClose(); onRefresh() }
    catch {} finally { setSaving(false) }
  }

  async function handleDelete() {
    await deudas.delete(item.id); onClose(); onRefresh()
  }

  return (
    <div>
      <div className="space-y-4 mb-6">
        <Row label="Tipo" value={item.tipo === 'me_deben' ? 'Me deben' : 'Yo debo'} />
        <Row label="Persona" value={item.persona} />
        <Row label="Monto" value={`Gs. ${item.monto.toLocaleString('es')}`} />
        {item.descripcion && <Row label="Descripción" value={item.descripcion} />}
        {item.fecha && <Row label="Fecha" value={new Date(item.fecha).toLocaleDateString('es')} />}
        <Row label="Estado" value={item.saldada ? 'Saldada ✓' : 'Pendiente'} />
      </div>
      <div className="space-y-2">
        <button onClick={toggleSaldada} disabled={saving} className="btn-primary">
          {saving ? '...' : item.saldada ? 'Reabrir' : 'Marcar como saldada'}
        </button>
        <button onClick={handleDelete} className="btn-danger">Eliminar</button>
      </div>
    </div>
  )
}

// ── Detalle cuota ──────────────────────────────────────────────────────────────
function DetalleCuota({ item, onClose, onRefresh }) {
  const [saving, setSaving] = useState(false)
  const pct = Math.min(100, Math.round((item.cuotas_pagadas / item.cuotas_totales) * 100))
  const completa = item.cuotas_pagadas >= item.cuotas_totales

  async function marcarPagada() {
    if (completa) return
    setSaving(true)
    try { await cuotas.update(item.id, { cuotas_pagadas: item.cuotas_pagadas + 1 }); onClose(); onRefresh() }
    catch {} finally { setSaving(false) }
  }

  async function handleDelete() {
    await cuotas.delete(item.id); onClose(); onRefresh()
  }

  return (
    <div>
      <div className="rounded-[18px] p-4 mb-5" style={{ background: '#F0F0F4' }}>
        <div className="flex justify-between mb-2">
          <span className="text-[12px] font-semibold" style={{ color: '#888A93' }}>Progreso</span>
          <span className="text-[13px] font-extrabold" style={{ color: '#0A8F60' }}>
            {item.cuotas_pagadas}/{item.cuotas_totales} cuotas
          </span>
        </div>
        <div className="w-full h-[8px] rounded-full overflow-hidden" style={{ background: '#E0E0E6' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0CAE73, #0A8F60)' }}
          />
        </div>
      </div>
      <div className="space-y-4 mb-6">
        <Row label="Monto total" value={`Gs. ${item.monto_total.toLocaleString('es')}`} />
        <Row label="Por cuota" value={`Gs. ${item.monto_cuota.toLocaleString('es')}`} />
        <Row label="Restante" value={`Gs. ${((item.cuotas_totales - item.cuotas_pagadas) * item.monto_cuota).toLocaleString('es')}`} />
        {item.fecha_inicio && <Row label="Inicio" value={new Date(item.fecha_inicio).toLocaleDateString('es')} />}
      </div>
      <div className="space-y-2">
        <button onClick={marcarPagada} disabled={saving || completa} className="btn-primary">
          {completa ? '✓ Completada' : saving ? '...' : 'Marcar cuota pagada'}
        </button>
        <button onClick={handleDelete} className="btn-danger">Eliminar</button>
      </div>
    </div>
  )
}

// ── Formulario nueva deuda ─────────────────────────────────────────────────────
function FormDeudaCuota({ userId, onSave, onCancel }) {
  const [tipoDeuda, setTipoDeuda] = useState('les_debo')
  const [persona, setPersona] = useState('')
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await deudas.create({ usuario_id: userId, persona, monto: Number(monto), tipo: tipoDeuda, descripcion: descripcion || null, fecha: fecha || null, saldada: false })
      onSave()
    } catch {} finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        {[['les_debo','Yo debo'], ['me_deben','Me deben']].map(([val, lbl]) => (
          <button key={val} type="button" onClick={() => setTipoDeuda(val)}
            className="flex-1 py-2 text-[13px] font-bold rounded-xl border transition-all"
            style={tipoDeuda === val
              ? { background: '#0E0F13', color: '#fff', borderColor: '#0E0F13' }
              : { borderColor: '#e5e5e5', color: '#888A93' }
            }
          >{lbl}</button>
        ))}
      </div>
      <div><label className="label">Persona</label><input required value={persona} onChange={e => setPersona(e.target.value)} placeholder="Nombre" className="input-field" /></div>
      <div><label className="label">Monto (Gs.)</label><input required type="number" min="0" value={monto} onChange={e => setMonto(e.target.value)} className="input-field" /></div>
      <div><label className="label">Descripción (opcional)</label><input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="¿Por qué?" className="input-field" /></div>
      <div><label className="label">Fecha (opcional)</label><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="input-field" /></div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? '...' : 'Guardar'}</button>
      </div>
    </form>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-flux-gray flex-shrink-0">{label}</span>
      <span className="text-sm font-semibold text-right" style={{ color: '#0E0F13' }}>{value}</span>
    </div>
  )
}
