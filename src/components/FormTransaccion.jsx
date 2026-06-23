import { useState } from 'react'
import { transacciones } from '../supabaseClient'

const CATEGORIAS_GASTO = ['comida','transporte','salud','entretenimiento','ropa','hogar','educacion','viajes','servicios','otro']
const CATEGORIAS_INGRESO = ['sueldo','freelance','otro']

export default function FormTransaccion({ userId, onSave, onCancel, inicial = {} }) {
  const [tipo, setTipo] = useState(inicial.tipo || 'gasto')
  const [descripcion, setDescripcion] = useState(inicial.descripcion || '')
  const [monto, setMonto] = useState(inicial.monto ? String(Math.abs(inicial.monto)) : '')
  const [categoria, setCategoria] = useState(inicial.categoria || '')
  const [fecha, setFecha] = useState(inicial.fecha?.slice(0,10) || new Date().toISOString().slice(0,10))
  const [notas, setNotas] = useState(inicial.notas || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cats = tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO

  async function handleSubmit(e) {
    e.preventDefault()
    if (!categoria) { setError('Elige una categoría'); return }
    setLoading(true)
    setError('')
    try {
      await transacciones.create({
        user_id: userId,
        tipo,
        descripcion,
        monto: Number(monto),
        categoria,
        fecha,
        notas: notas || null
      })
      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo */}
      <div className="flex rounded-xl border border-flux-border p-1 gap-1">
        {['gasto','ingreso'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { setTipo(t); setCategoria('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tipo === t ? 'bg-flux-black text-white' : 'text-flux-gray'
            }`}
          >
            {t === 'gasto' ? 'Gasto' : 'Ingreso'}
          </button>
        ))}
      </div>

      {/* Monto */}
      <div>
        <label className="label">Monto</label>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-flux-gray">$</span>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            placeholder="0.00"
            className="input-field text-2xl font-bold flex-1"
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="label">Descripción</label>
        <input
          type="text"
          required
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="¿En qué?"
          className="input-field"
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="label">Categoría</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {cats.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                categoria === c
                  ? 'bg-flux-black text-white border-flux-black'
                  : 'border-flux-border text-flux-gray hover:border-flux-gray'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Fecha */}
      <div>
        <label className="label">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Notas */}
      <div>
        <label className="label">Notas (opcional)</label>
        <input
          type="text"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Comentario..."
          className="input-field"
        />
      </div>

      {error && <p className="text-xs text-flux-red">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? '...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
