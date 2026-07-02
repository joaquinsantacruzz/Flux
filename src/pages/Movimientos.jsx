import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { movimientos } from '../supabaseClient'
import TransaccionCard from '../components/TransaccionCard'
import Modal from '../components/Modal'
import FormTransaccion from '../components/FormTransaccion'
import EmptyState from '../components/EmptyState'

const FILTROS = ['todos','gasto','ingreso']

export default function Movimientos() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [items, setItems] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [mesSel, setMesSel] = useState({ month: now.getMonth(), year: now.getFullYear() })

  const esMesActual = mesSel.month === now.getMonth() && mesSel.year === now.getFullYear()

  function mesAnterior() {
    setMesSel(m => m.month === 0 ? { month: 11, year: m.year - 1 } : { month: m.month - 1, year: m.year })
  }
  function mesSiguiente() {
    setMesSel(m => {
      const next = m.month === 11 ? { month: 0, year: m.year + 1 } : { month: m.month + 1, year: m.year }
      if (next.year > now.getFullYear() || (next.year === now.getFullYear() && next.month > now.getMonth())) return m
      return next
    })
  }

  const mesLabel = new Date(mesSel.year, mesSel.month, 1)
    .toLocaleDateString('es', { month: 'long', year: 'numeric' })

  async function load() {
    if (!userId) return
    try {
      const data = await movimientos.list(userId)
      setItems(data || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [userId])

  function fechaMes(fecha) {
    const [y, m] = fecha.slice(0, 7).split('-').map(Number)
    return { year: y, month: m - 1 }
  }

  const filtrados = items.filter(t => {
    const { year, month } = fechaMes(t.fecha)
    const matchMes = month === mesSel.month && year === mesSel.year
    const matchTipo = filtro === 'todos' || t.tipo === filtro
    const matchBusq = !busqueda || t.nota_desc.toLowerCase().includes(busqueda.toLowerCase())
    return matchMes && matchTipo && matchBusq
  })

  const grupos = {}
  filtrados.forEach(t => {
    const key = new Date(t.fecha).toLocaleDateString('es', { day: 'numeric', month: 'long' })
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(t)
  })

  async function handleDelete(id) {
    await movimientos.delete(id)
    setSelected(null)
    load()
  }

  return (
    <div className="page-container animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Movimientos</h1>
          <div className="flex items-center gap-[6px] mt-[2px]">
            <button onClick={mesAnterior} className="w-[18px] h-[18px] rounded-full grid place-items-center" style={{ background: 'rgba(14,15,19,.08)' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" stroke="#42434A" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <p className="text-[12px] font-semibold capitalize" style={{ color: '#888A93' }}>{mesLabel}</p>
            <button onClick={mesSiguiente} disabled={esMesActual} className="w-[18px] h-[18px] rounded-full grid place-items-center" style={{ background: 'rgba(14,15,19,.08)', opacity: esMesActual ? 0.3 : 1 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" stroke="#42434A" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 bg-flux-black text-white rounded-full flex items-center justify-center text-xl hover:bg-gray-800 active:scale-95 transition-all"
        >
          +
        </button>
      </div>

      {/* Búsqueda */}
      <input
        type="text"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar..."
        className="w-full bg-flux-light rounded-xl px-4 py-2.5 text-sm mb-4 placeholder-flux-gray"
      />

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {FILTROS.map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
              filtro === f ? 'bg-flux-black text-white' : 'bg-flux-light text-flux-gray'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-flux-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <EmptyState icon="📭" title={`Sin movimientos`} subtitle={`No hay registros en ${mesLabel}`} />
      ) : (
        Object.entries(grupos).map(([dia, txs]) => (
          <div key={dia} className="mb-6">
            <p className="section-title capitalize">{dia}</p>
            <div className="divide-y divide-flux-border/40">
              {txs.map(t => (
                <TransaccionCard key={t.id} transaccion={t} onClick={() => setSelected(t)} />
              ))}
            </div>
          </div>
        ))
      )}

      {showForm && (
        <Modal title="Nueva transacción" onClose={() => setShowForm(false)}>
          <FormTransaccion userId={userId} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {selected && (
        <Modal title="Transacción" onClose={() => setSelected(null)}>
          <div className="space-y-3 mb-6">
            {[
              ['Descripción', selected.nota_desc],
              ['Monto', `Gs. ${Math.abs(selected.monto).toLocaleString('es')}`],
              ['Tipo', selected.tipo === 'gasto' ? 'Gasto' : 'Ingreso'],
              ['Categoría', selected.categoria],
              ['Fecha', new Date(selected.fecha).toLocaleDateString('es')],
              selected.nota && ['Notas', selected.nota],
            ].filter(Boolean).map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-xs text-flux-gray">{l}</span>
                <span className="text-sm font-medium capitalize">{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => handleDelete(selected.id)} className="btn-danger">Eliminar</button>
        </Modal>
      )}
    </div>
  )
}
