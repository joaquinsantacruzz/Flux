import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { deudas, cuotas } from '../supabaseClient'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

export default function Deudas() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [items, setItems] = useState([])
  const [cuotasList, setCuotasList] = useState([])
  const [tab, setTab] = useState('deudas') // 'deudas' | 'cuotas'
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

  const totalDeudas = items.reduce((s, d) => s + d.monto_pendiente, 0)
  const totalCuotas = cuotasList.reduce((s, c) => s + c.monto_cuota, 0)

  return (
    <div className="page-container animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Deudas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 bg-flux-black text-white rounded-full flex items-center justify-center text-xl hover:bg-gray-800 active:scale-95 transition-all"
        >
          +
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card">
          <p className="text-xs text-flux-gray">Total deudas</p>
          <p className="text-lg font-bold text-flux-red mt-1">${totalDeudas.toLocaleString('es')}</p>
        </div>
        <div className="card">
          <p className="text-xs text-flux-gray">Cuotas/mes</p>
          <p className="text-lg font-bold text-flux-black mt-1">${totalCuotas.toLocaleString('es')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-flux-light rounded-xl p-1 mb-5">
        {[['deudas','Deudas'],['cuotas','Cuotas']].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              tab === val ? 'bg-white text-flux-black shadow-sm' : 'text-flux-gray'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-flux-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'deudas' ? (
        items.length === 0 ? (
          <EmptyState icon="✅" title="Sin deudas" subtitle="¡Estás libre de deudas!" />
        ) : (
          <div className="space-y-3">
            {items.map(d => (
              <button
                key={d.id}
                onClick={() => setSelected({ tipo: 'deuda', ...d })}
                className="card w-full text-left hover:border-flux-gray transition-colors active:scale-[0.98]"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{d.descripcion}</p>
                    <p className="text-xs text-flux-gray mt-0.5">{d.acreedor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-flux-red">${d.monto_pendiente.toLocaleString('es')}</p>
                    {d.fecha_vencimiento && (
                      <p className="text-xs text-flux-gray">Vence {new Date(d.fecha_vencimiento).toLocaleDateString('es')}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        cuotasList.length === 0 ? (
          <EmptyState icon="📋" title="Sin cuotas" subtitle="Agrega tus pagos recurrentes" />
        ) : (
          <div className="space-y-3">
            {cuotasList.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected({ tipo: 'cuota', ...c })}
                className="card w-full text-left hover:border-flux-gray transition-colors active:scale-[0.98]"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{c.descripcion}</p>
                    <p className="text-xs text-flux-gray mt-0.5 capitalize">{c.frecuencia}</p>
                  </div>
                  <p className="font-bold">${c.monto_cuota.toLocaleString('es')}</p>
                </div>
              </button>
            ))}
          </div>
        )
      )}

      {showForm && (
        <Modal title="Agregar" onClose={() => setShowForm(false)}>
          <FormDeuda userId={userId} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {selected && (
        <Modal title={selected.descripcion} onClose={() => setSelected(null)}>
          <div className="space-y-3 mb-6">
            {selected.tipo === 'deuda' ? (
              <>
                <Row label="Acreedor" value={selected.acreedor} />
                <Row label="Monto pendiente" value={`$${selected.monto_pendiente.toLocaleString('es')}`} />
                {selected.fecha_vencimiento && <Row label="Vencimiento" value={new Date(selected.fecha_vencimiento).toLocaleDateString('es')} />}
                {selected.notas && <Row label="Notas" value={selected.notas} />}
              </>
            ) : (
              <>
                <Row label="Monto" value={`$${selected.monto_cuota.toLocaleString('es')}`} />
                <Row label="Frecuencia" value={selected.frecuencia} />
                {selected.proximo_pago && <Row label="Próximo pago" value={new Date(selected.proximo_pago).toLocaleDateString('es')} />}
              </>
            )}
          </div>
          <button
            onClick={async () => {
              if (selected.tipo === 'deuda') await deudas.delete(selected.id)
              else await cuotas.delete(selected.id)
              setSelected(null); load()
            }}
            className="btn-danger"
          >
            Eliminar
          </button>
        </Modal>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-flux-gray">{label}</span>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  )
}

function FormDeuda({ userId, onSave, onCancel }) {
  const [tipo, setTipo] = useState('deuda')
  // deuda
  const [descripcion, setDescripcion] = useState('')
  const [acreedor, setAcreedor] = useState('')
  const [monto, setMonto] = useState('')
  const [fechaVenc, setFechaVenc] = useState('')
  // cuota
  const [montoCuota, setMontoCuota] = useState('')
  const [frecuencia, setFrecuencia] = useState('mensual')
  const [proximoPago, setProximoPago] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (tipo === 'deuda') {
        await deudas.create({
          user_id: userId, descripcion, acreedor,
          monto_pendiente: Number(monto), fecha_vencimiento: fechaVenc || null
        })
      } else {
        await cuotas.create({
          user_id: userId, descripcion, monto_cuota: Number(montoCuota),
          frecuencia, proximo_pago: proximoPago || null
        })
      }
      onSave()
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-xl border border-flux-border p-1 gap-1">
        {['deuda','cuota'].map(t => (
          <button key={t} type="button" onClick={() => setTipo(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
              tipo === t ? 'bg-flux-black text-white' : 'text-flux-gray'
            }`}>{t}</button>
        ))}
      </div>

      <div>
        <label className="label">Descripción</label>
        <input required value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Préstamo banco" className="input-field" />
      </div>

      {tipo === 'deuda' ? (
        <>
          <div>
            <label className="label">Acreedor</label>
            <input required value={acreedor} onChange={e => setAcreedor(e.target.value)} placeholder="Banco / persona" className="input-field" />
          </div>
          <div>
            <label className="label">Monto pendiente ($)</label>
            <input required type="number" min="0" value={monto} onChange={e => setMonto(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Fecha vencimiento</label>
            <input type="date" value={fechaVenc} onChange={e => setFechaVenc(e.target.value)} className="input-field" />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="label">Monto ($)</label>
            <input required type="number" min="0" value={montoCuota} onChange={e => setMontoCuota(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Frecuencia</label>
            <select value={frecuencia} onChange={e => setFrecuencia(e.target.value)} className="input-field">
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div>
            <label className="label">Próximo pago</label>
            <input type="date" value={proximoPago} onChange={e => setProximoPago(e.target.value)} className="input-field" />
          </div>
        </>
      )}

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? '...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
