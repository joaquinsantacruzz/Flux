import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { transacciones } from '../supabaseClient'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#111111','#666666','#aaaaaa','#cccccc','#e5e5e5','#f5f5f5','#22c55e','#ef4444','#3b82f6','#f59e0b']

export default function Estadisticas() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [items, setItems] = useState([])
  const [periodo, setPeriodo] = useState('mes') // 'mes' | 'año'

  useEffect(() => {
    if (!userId) return
    transacciones.list(userId).then(d => setItems(d || [])).catch(() => {})
  }, [userId])

  const now = new Date()
  const filtrados = items.filter(t => {
    const d = new Date(t.fecha)
    if (periodo === 'mes') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return d.getFullYear() === now.getFullYear()
  })

  // Por categoría
  const porCategoria = {}
  filtrados.filter(t => t.tipo === 'gasto').forEach(t => {
    porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.monto
  })
  const pieData = Object.entries(porCategoria)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value)

  // Por mes (últimos 6)
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleDateString('es', { month: 'short' })
    const gastos = items.filter(t => {
      const td = new Date(t.fecha)
      return t.tipo === 'gasto' && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
    }).reduce((s, t) => s + t.monto, 0)
    const ingresos = items.filter(t => {
      const td = new Date(t.fecha)
      return t.tipo === 'ingreso' && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
    }).reduce((s, t) => s + t.monto, 0)
    return { label, gastos, ingresos }
  })

  const totalGastos = filtrados.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const totalIngresos = filtrados.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)

  return (
    <div className="page-container animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <div className="flex gap-1 bg-flux-light rounded-lg p-1">
          {['mes','año'].map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                periodo === p ? 'bg-white text-flux-black shadow-sm' : 'text-flux-gray'
              }`}
            >
              {p === 'mes' ? 'Este mes' : 'Este año'}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card">
          <p className="text-xs text-flux-gray">Gastos</p>
          <p className="text-xl font-bold text-flux-red mt-1">${totalGastos.toLocaleString('es')}</p>
        </div>
        <div className="card">
          <p className="text-xs text-flux-gray">Ingresos</p>
          <p className="text-xl font-bold text-flux-green mt-1">${totalIngresos.toLocaleString('es')}</p>
        </div>
      </div>

      {/* Barras */}
      <div className="card mb-6">
        <p className="text-sm font-semibold mb-4">Últimos 6 meses</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} barSize={8} barGap={2}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              formatter={(v) => `$${v.toLocaleString('es')}`}
              contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }}
            />
            <Bar dataKey="ingresos" fill="#22c55e" radius={4} name="Ingresos" />
            <Bar dataKey="gastos" fill="#ef4444" radius={4} name="Gastos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie por categoría */}
      {pieData.length > 0 && (
        <div className="card mb-6">
          <p className="text-sm font-semibold mb-4">Gastos por categoría</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `$${v.toLocaleString('es')}`}
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {pieData.slice(0,5).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs capitalize text-flux-gray">{d.name}</span>
                </div>
                <span className="text-xs font-medium">${d.value.toLocaleString('es')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
