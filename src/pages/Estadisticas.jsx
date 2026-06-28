import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { movimientos } from '../supabaseClient'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer
} from 'recharts'

const PIE_COLORS = ['#0CAE73','#0EA5E9','#7C5CFF','#E08600','#E5484D','#42434A','#0A8F60','#F59E0B']

const CAT_ICONS = {
  cenas:'🍽️', comida:'🍽️', transporte:'🚌', salud:'🏥', entretenimiento:'🎬',
  ropa:'👕', hogar:'🏠', educacion:'📚', viajes:'✈️',
  servicios:'⚡', sueldo:'💼', freelance:'💻', otro:'💰',
  suscripciones:'📱', mascotas:'🐾', supermercado:'🛒',
  prestamo_banco:'🏦', prestamo_coop:'🤝', tarjeta_credito:'💳',
}

const SHADOW = '0 8px 22px -10px rgba(14,15,19,.18), 0 1px 2px rgba(14,15,19,.04)'
const BORDER = '1px solid rgba(14,15,19,.06)'

const TooltipStyle = {
  borderRadius: 12, border: BORDER, fontSize: 12,
  fontFamily: 'Manrope', fontWeight: 600,
  boxShadow: SHADOW,
}

export default function Estadisticas() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('mes')

  useEffect(() => {
    if (!userId) return
    movimientos.list(userId)
      .then(d => setItems(d || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const now = new Date()

  const filtrados = items.filter(t => {
    const d = new Date(t.fecha)
    if (periodo === 'mes') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return d.getFullYear() === now.getFullYear()
  })

  const totalIngresos = filtrados.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const totalGastos   = filtrados.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const savingsRate   = totalIngresos > 0 ? Math.round(((totalIngresos - totalGastos) / totalIngresos) * 100) : null

  const porCategoria = {}
  filtrados.filter(t => t.tipo === 'gasto').forEach(t => {
    porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.monto
  })
  const pieData = Object.entries(porCategoria)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleDateString('es', { month: 'short' })
    const gastos   = items.filter(t => { const td = new Date(t.fecha); return t.tipo === 'gasto'    && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() }).reduce((s,t)=>s+t.monto,0)
    const ingresos = items.filter(t => { const td = new Date(t.fecha); return t.tipo === 'ingreso'  && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() }).reduce((s,t)=>s+t.monto,0)
    return { label, gastos, ingresos }
  })

  const mesLabel = periodo === 'mes'
    ? now.toLocaleDateString('es', { month: 'long', year: 'numeric' })
    : now.getFullYear().toString()

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#E7E8EE' }}>

      {/* Header */}
      <div className="max-w-md mx-auto px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold" style={{ letterSpacing: '-.5px' }}>Estadísticas</h1>
            <p className="text-[12px] font-semibold capitalize" style={{ color: '#888A93' }}>{mesLabel}</p>
          </div>
          {/* Segment selector */}
          <div className="flex gap-1 p-1 rounded-[12px]" style={{ background: 'rgba(14,15,19,.08)' }}>
            {[{ key:'mes', label:'Este mes' }, { key:'año', label:'Este año' }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriodo(key)}
                className="px-3 py-[5px] rounded-[9px] text-[11.5px] font-bold transition-all"
                style={periodo === key
                  ? { background:'#fff', color:'#0E0F13', boxShadow:'0 1px 4px rgba(14,15,19,.12)' }
                  : { color:'#888A93' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center pt-16">
          <div className="w-6 h-6 rounded-full border-2 border-flux-black border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="max-w-md mx-auto px-4 grid grid-cols-2 gap-[13px]">

          {/* Ingresos */}
          <div className="bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
            <div className="w-[30px] h-[30px] rounded-[9px] grid place-items-center mb-3" style={{ background: '#E6F6EF' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" stroke="#0A8F60" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M9 7h8v8"/>
              </svg>
            </div>
            <p className="text-[11.5px] font-semibold" style={{ color:'#888A93' }}>Ingresos</p>
            <p className="text-[21px] font-extrabold mt-1 tabular-nums" style={{ letterSpacing:'-.6px', color:'#0A8F60' }}>
              Gs. {totalIngresos.toLocaleString('es')}
            </p>
          </div>

          {/* Gastos */}
          <div className="bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
            <div className="w-[30px] h-[30px] rounded-[9px] grid place-items-center mb-3" style={{ background:'#FDEAEA' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" stroke="#E5484D" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7l10 10M17 7v8H9"/>
              </svg>
            </div>
            <p className="text-[11.5px] font-semibold" style={{ color:'#888A93' }}>Gastos</p>
            <p className="text-[21px] font-extrabold mt-1 tabular-nums" style={{ letterSpacing:'-.6px', color:'#0E0F13' }}>
              Gs. {totalGastos.toLocaleString('es')}
            </p>
          </div>

          {/* Tasa de ahorro */}
          {savingsRate !== null && (
            <div className="bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
              <p className="text-[11.5px] font-semibold mb-2" style={{ color:'#888A93' }}>Tasa de ahorro</p>
              <p
                className="text-[30px] font-extrabold tabular-nums leading-none"
                style={{
                  letterSpacing:'-.8px',
                  color: savingsRate >= 20 ? '#0A8F60' : savingsRate >= 0 ? '#E08600' : '#E5484D'
                }}
              >
                {savingsRate}%
              </p>
              <p className="text-[11px] font-semibold mt-2" style={{ color:'#B0B2BB' }}>
                {savingsRate >= 20 ? '¡Excelente!' : savingsRate >= 0 ? 'Podés mejorar' : 'Déficit del mes'}
              </p>
            </div>
          )}

          {/* Mayor categoría de gasto */}
          {pieData[0] && (
            <div className="bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
              <p className="text-[11.5px] font-semibold mb-2" style={{ color:'#888A93' }}>Mayor gasto</p>
              <p className="text-[28px] leading-none">{CAT_ICONS[pieData[0].name] || '💰'}</p>
              <p className="text-[13px] font-extrabold mt-2 capitalize" style={{ color:'#0E0F13' }}>{pieData[0].name}</p>
              <p className="text-[11px] font-semibold tabular-nums" style={{ color:'#B0B2BB' }}>
                Gs. {pieData[0].value.toLocaleString('es')}
              </p>
            </div>
          )}

          {/* Bar chart — últimos 6 meses */}
          <div className="col-span-2 bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
            <p className="text-[14px] font-extrabold mb-1" style={{ letterSpacing:'-.2px' }}>Últimos 6 meses</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background:'#0CAE73' }}/>
                <span className="text-[11px] font-semibold" style={{ color:'#888A93' }}>Ingresos</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background:'#E5484D' }}/>
                <span className="text-[11px] font-semibold" style={{ color:'#888A93' }}>Gastos</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={barData} barSize={10} barGap={3} margin={{ left:0, right:0, top:0, bottom:0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize:10, fill:'#888A93', fontFamily:'Manrope', fontWeight:600 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={(v) => `Gs. ${v.toLocaleString('es')}`}
                  contentStyle={TooltipStyle}
                  cursor={{ fill:'rgba(14,15,19,.04)' }}
                />
                <Bar dataKey="ingresos" fill="#0CAE73" radius={[4,4,0,0]} name="Ingresos"/>
                <Bar dataKey="gastos"   fill="#E5484D" radius={[4,4,0,0]} name="Gastos"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart — por categoría */}
          {pieData.length > 0 && (
            <div className="col-span-2 bg-white rounded-[22px] p-[19px]" style={{ boxShadow: SHADOW, border: BORDER }}>
              <p className="text-[14px] font-extrabold mb-4" style={{ letterSpacing:'-.2px' }}>Gastos por categoría</p>
              <div className="flex items-center gap-5">
                <div style={{ width:148, height:148, flexShrink:0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData} cx="50%" cy="50%"
                        innerRadius={42} outerRadius={66}
                        dataKey="value" paddingAngle={3} stroke="none"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => `Gs. ${v.toLocaleString('es')}`}
                        contentStyle={{ ...TooltipStyle, fontSize:11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-[9px] min-w-0">
                  {pieData.slice(0, 5).map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}/>
                      <span className="text-[12px] capitalize flex-1 truncate font-semibold" style={{ color:'#42434A' }}>{d.name}</span>
                      <span className="text-[11.5px] font-bold tabular-nums" style={{ color:'#0E0F13' }}>Gs. {d.value.toLocaleString('es')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {filtrados.length === 0 && (
            <div className="col-span-2 bg-white rounded-[22px] p-8 text-center" style={{ boxShadow: SHADOW, border: BORDER }}>
              <p className="text-3xl mb-3">📊</p>
              <p className="text-[14px] font-extrabold" style={{ color:'#0E0F13' }}>Sin datos para este período</p>
              <p className="text-[12px] font-medium mt-1" style={{ color:'#888A93' }}>Agregá movimientos desde Inicio</p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
