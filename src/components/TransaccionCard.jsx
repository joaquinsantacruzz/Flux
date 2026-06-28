const CAT_LABEL = {
  supermercado: 'Supermercado', cenas: 'Cenas', comida: 'Cenas', transporte: 'Transporte',
  salud: 'Salud', entretenimiento: 'Entretenimiento', ropa: 'Ropa',
  hogar: 'Hogar', educacion: 'Educación', viajes: 'Viajes', servicios: 'Servicios',
  suscripciones: 'Suscripciones', mascotas: 'Mascotas',
  prestamo_banco: 'Préstamo banco', prestamo_coop: 'Préstamo cooperativa',
  tarjeta_credito: 'Tarjeta de crédito', otro: 'Otro',
  sueldo: 'Sueldo', freelance: 'Freelance',
}

const ICONS = {
  cenas: '🍽️', comida: '🍽️', transporte: '🚌', salud: '🏥', entretenimiento: '🎬',
  ropa: '👕', hogar: '🏠', educacion: '📚', viajes: '✈️',
  servicios: '⚡', sueldo: '💼', freelance: '💻', otro: '💰',
  suscripciones: '📱', mascotas: '🐾', supermercado: '🛒',
  prestamo_banco: '🏦', prestamo_coop: '🤝', tarjeta_credito: '💳',
}

export default function TransaccionCard({ transaccion, onClick }) {
  const { nota_desc, monto, tipo, categoria, fecha } = transaccion
  const icon = ICONS[categoria] || '💰'
  const esGasto = tipo === 'gasto'
  const fechaFmt = new Date(fecha).toLocaleDateString('es', { day: '2-digit', month: 'short' })

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full py-3 text-left active:bg-flux-light rounded-xl px-2 -mx-2 transition-colors"
    >
      <span className="w-10 h-10 rounded-xl bg-flux-light flex items-center justify-center text-lg flex-shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-flux-black truncate">{nota_desc}</p>
        <p className="text-xs text-flux-gray">{fechaFmt} · {CAT_LABEL[categoria] || categoria}</p>
      </div>
      <span className={esGasto ? 'amount-negative text-sm' : 'amount-positive text-sm'}>
        {esGasto ? '−' : '+'} Gs. {Math.abs(monto).toLocaleString('es')}
      </span>
    </button>
  )
}
