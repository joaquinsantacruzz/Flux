import { useState } from 'react'
import { movimientos } from '../supabaseClient'

const CATEGORIAS_GASTO = [
  'supermercado','cenas','transporte','salud',
  'ropa','hogar','educacion','viajes',
  'suscripciones','mascotas','prestamo_banco','prestamo_coop','tarjeta_credito','otro',
]
const CATEGORIAS_INGRESO = ['sueldo','freelance','otro']

const CAT_LABEL = {
  supermercado: 'Supermercado', cenas: 'Cenas', comida: 'Cenas', transporte: 'Transporte',
  salud: 'Salud', entretenimiento: 'Entretenimiento', ropa: 'Ropa',
  hogar: 'Hogar', educacion: 'Educación', viajes: 'Viajes', servicios: 'Servicios',
  suscripciones: 'Suscripciones', mascotas: 'Mascotas',
  prestamo_banco: 'Préstamo banco', prestamo_coop: 'Préstamo cooperativa',
  tarjeta_credito: 'Tarjeta de crédito', otro: 'Otro',
  sueldo: 'Sueldo', freelance: 'Freelance',
}

export default function FormTransaccion({ userId, movId, onSave, onCancel, inicial = {} }) {
  const [tipo, setTipo] = useState(inicial.tipo || 'gasto')
  const [nota_desc, setNotaDesc] = useState(inicial.nota_desc || '')
  const [monto, setMonto] = useState(inicial.monto ? String(Math.abs(inicial.monto)) : '')
  const [categoria, setCategoria] = useState(inicial.categoria || '')
  const [fecha, setFecha] = useState(inicial.fecha?.slice(0,10) || new Date().toISOString().slice(0,10))
  const [nota, setNota] = useState(inicial.nota || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cats = tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO

  async function handleSubmit(e) {
    e.preventDefault()
    if (!categoria) { setError('Elige una categoría'); return }
    setLoading(true)
    setError('')
    try {
      const data = { tipo, nota_desc, monto: Number(monto), categoria, fecha, nota: nota || null }
      if (movId) {
        await movimientos.update(movId, data)
      } else {
        await movimientos.create({ usuario_id: userId, ...data })
      }
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
          <span className="text-2xl font-bold text-flux-gray">Gs.</span>
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
          value={nota_desc}
          onChange={e => setNotaDesc(e.target.value)}
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
              {CAT_LABEL[c] || c}
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
          value={nota}
          onChange={e => setNota(e.target.value)}
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
