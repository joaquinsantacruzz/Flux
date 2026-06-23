import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { transacciones } from '../supabaseClient'
import TransaccionCard from '../components/TransaccionCard'
import Modal from '../components/Modal'
import FormTransaccion from '../components/FormTransaccion'
import EmptyState from '../components/EmptyState'

export default function Inicio() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)

  async function load() {
    if (!userId) return
    try {
      const data = await transacciones.list(userId)
      setItems(data || [])
    } catch {
      // offline: usa caché local
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [userId])

  const ingresos = items.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const gastos   = items.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const balance  = ingresos - gastos

  const recientes = items.slice(0, 10)

  async function handleDelete(id) {
    await transacciones.delete(id)
    setSelected(null)
    load()
  }

  return (
    <div className="page-container animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-flux-gray">Balance total</p>
          <h2 className={`text-4xl font-bold tracking-tight ${balance < 0 ? 'text-flux-red' : 'text-flux-black'}`}>
            ${balance.toLocaleString('es')}
          </h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-11 h-11 bg-flux-black text-white rounded-full flex items-center justify-center text-2xl leading-none hover:bg-gray-800 active:scale-95 transition-all"
        >
          +
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="card">
          <p className="text-xs text-flux-gray mb-1">Ingresos</p>
          <p className="text-xl font-bold text-flux-green">+${ingresos.toLocaleString('es')}</p>
        </div>
        <div className="card">
          <p className="text-xs text-flux-gray mb-1">Gastos</p>
          <p className="text-xl font-bold text-flux-red">-${gastos.toLocaleString('es')}</p>
        </div>
      </div>

      {/* Recientes */}
      <p className="section-title">Recientes</p>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-flux-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recientes.length === 0 ? (
        <EmptyState icon="💸" title="Sin transacciones" subtitle="Toca + para agregar una" />
      ) : (
        <div className="divide-y divide-flux-border/40">
          {recientes.map(t => (
            <TransaccionCard key={t.id} transaccion={t} onClick={() => setSelected(t)} />
          ))}
        </div>
      )}

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

      {/* Modal detalle */}
      {selected && (
        <Modal title="Transacción" onClose={() => setSelected(null)}>
          <div className="space-y-3 mb-6">
            <Row label="Descripción" value={selected.descripcion} />
            <Row label="Monto" value={`$${Math.abs(selected.monto).toLocaleString('es')}`} />
            <Row label="Tipo" value={selected.tipo === 'gasto' ? 'Gasto' : 'Ingreso'} />
            <Row label="Categoría" value={selected.categoria} />
            <Row label="Fecha" value={new Date(selected.fecha).toLocaleDateString('es')} />
            {selected.notas && <Row label="Notas" value={selected.notas} />}
          </div>
          <button
            onClick={() => handleDelete(selected.id)}
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
