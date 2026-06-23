import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { metas } from '../supabaseClient'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

export default function Metas() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!userId) return
    try { setItems((await metas.list(userId)) || []) } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [userId])

  return (
    <div className="page-container animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Metas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 bg-flux-black text-white rounded-full flex items-center justify-center text-xl hover:bg-gray-800 active:scale-95 transition-all"
        >
          +
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-flux-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="🎯" title="Sin metas" subtitle="Agrega una meta de ahorro" />
      ) : (
        <div className="space-y-3">
          {items.map(m => {
            const pct = Math.min(100, Math.round((m.actual / m.objetivo) * 100))
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className="card w-full text-left hover:border-flux-gray transition-colors active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-flux-black">{m.nombre}</p>
                    <p className="text-xs text-flux-gray mt-0.5">
                      {m.fecha_limite ? `Hasta ${new Date(m.fecha_limite).toLocaleDateString('es')}` : 'Sin fecha límite'}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${pct >= 100 ? 'text-flux-green' : 'text-flux-black'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="w-full bg-flux-light rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-flux-green' : 'bg-flux-black'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-flux-gray">${m.actual.toLocaleString('es')}</span>
                  <span className="text-xs text-flux-gray">de ${m.objetivo.toLocaleString('es')}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {showForm && (
        <Modal title="Nueva meta" onClose={() => setShowForm(false)}>
          <FormMeta userId={userId} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {selected && (
        <Modal title={selected.nombre} onClose={() => setSelected(null)}>
          <AbonarMeta meta={selected} onSave={() => { setSelected(null); load() }} onDelete={async () => {
            await metas.delete(selected.id); setSelected(null); load()
          }} />
        </Modal>
      )}
    </div>
  )
}

function FormMeta({ userId, onSave, onCancel }) {
  const [nombre, setNombre] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await metas.create({ user_id: userId, nombre, objetivo: Number(objetivo), actual: 0, fecha_limite: fechaLimite || null })
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
        <label className="label">Objetivo ($)</label>
        <input required type="number" min="1" value={objetivo} onChange={e => setObjetivo(e.target.value)} placeholder="0" className="input-field" />
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

function AbonarMeta({ meta, onSave, onDelete }) {
  const pct = Math.min(100, Math.round((meta.actual / meta.objetivo) * 100))
  const [abono, setAbono] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAbono(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await metas.update(meta.id, { actual: meta.actual + Number(abono) })
      onSave()
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div>
      <div className="mb-5">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-flux-gray">Progreso</span>
          <span className="text-sm font-bold">{pct}%</span>
        </div>
        <div className="w-full bg-flux-light rounded-full h-2">
          <div className={`h-2 rounded-full ${pct >= 100 ? 'bg-flux-green' : 'bg-flux-black'}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-flux-gray">
          <span>${meta.actual.toLocaleString('es')} ahorrado</span>
          <span>${meta.objetivo.toLocaleString('es')} objetivo</span>
        </div>
      </div>

      <form onSubmit={handleAbono} className="space-y-3 mb-4">
        <div>
          <label className="label">Abonar monto</label>
          <input required type="number" min="1" value={abono} onChange={e => setAbono(e.target.value)} placeholder="$0" className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? '...' : 'Abonar'}</button>
      </form>
      <button onClick={onDelete} className="btn-danger">Eliminar meta</button>
    </div>
  )
}
