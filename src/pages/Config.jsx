import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']
const SHADOW = '0 8px 22px -10px rgba(14,15,19,.18), 0 1px 2px rgba(14,15,19,.04)'
const BORDER = '1px solid rgba(14,15,19,.06)'

export default function Config() {
  const { session, logout } = useAuth()
  const nombre = session?.user?.nombre || ''
  const cedula = session?.user?.cedula || ''
  const hasPin = !!localStorage.getItem('flux_pin')
  const [showPinModal, setShowPinModal] = useState(false)
  const inicial = (nombre[0] || 'U').toUpperCase()

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#E7E8EE' }}>

      {/* Header */}
      <div className="max-w-md mx-auto px-4 pt-5 pb-4">
        <h1 className="text-[22px] font-extrabold" style={{ letterSpacing: '-.5px' }}>Configuración</h1>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-[13px]">

        {/* Perfil */}
        <div
          className="rounded-[24px] p-5 flex items-center gap-4 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0CAE73 0%, #0AA079 45%, #0E93A6 100%)', boxShadow: '0 18px 36px -16px rgba(12,150,120,.5)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(110% 80% at 100% 0%, rgba(255,255,255,.18), transparent 55%)' }}
          />
          <div
            className="w-[52px] h-[52px] rounded-[16px] grid place-items-center text-xl font-extrabold flex-shrink-0"
            style={{ background: 'rgba(255,255,255,.22)', backdropFilter: 'blur(8px)' }}
          >
            {inicial}
          </div>
          <div className="min-w-0">
            <p className="text-[17px] font-extrabold truncate" style={{ letterSpacing: '-.3px' }}>{nombre}</p>
            <p className="text-[12.5px] font-semibold mt-[2px]" style={{ color: 'rgba(255,255,255,.75)' }}>
              Cédula {cedula}
            </p>
          </div>
        </div>

        {/* Seguridad */}
        <Section title="Seguridad">
          <SettingRow
            label="PIN de seguridad"
            sub={hasPin ? 'Configurado · toca para cambiar' : 'Sin PIN — toca para activar'}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            }
            badge={hasPin ? 'Activo' : null}
            onClick={() => setShowPinModal(true)}
          />
        </Section>

        {/* Acerca de */}
        <Section title="Acerca de">
          <InfoRow label="Versión" value="0.1.0" />
          <InfoRow label="Modo" value="PWA" />
          <InfoRow label="Almacenamiento" value="Supabase" last />
        </Section>

        {/* Cerrar sesión */}
        <button
          onClick={logout}
          className="w-full rounded-[18px] py-4 text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ background: '#FDEAEA', color: '#E5484D', border: '1px solid rgba(229,72,77,.15)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </button>

      </div>

      {showPinModal && (
        <Modal title={hasPin ? 'Cambiar PIN' : 'Configurar PIN'} onClose={() => setShowPinModal(false)}>
          <PinSetup onDone={() => setShowPinModal(false)} />
        </Modal>
      )}
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-[22px] overflow-hidden" style={{ boxShadow: SHADOW, border: BORDER }}>
      <p className="text-[10.5px] font-extrabold uppercase tracking-widest px-[19px] pt-[16px] pb-[10px]" style={{ color: '#B0B2BB' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

// ── Setting row (tappable) ─────────────────────────────────────────────────────
function SettingRow({ label, sub, icon, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-[19px] py-[14px] active:bg-flux-light transition-colors text-left"
      style={{ borderTop: BORDER }}
    >
      <div className="w-[34px] h-[34px] rounded-[10px] grid place-items-center flex-shrink-0" style={{ background: '#F0F0F4', color: '#42434A' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold" style={{ color: '#0E0F13' }}>{label}</p>
        {sub && <p className="text-[11.5px] font-semibold mt-[1px]" style={{ color: '#888A93' }}>{sub}</p>}
      </div>
      {badge && (
        <span className="text-[11px] font-bold px-[9px] py-[3px] rounded-full flex-shrink-0" style={{ background: '#E6F6EF', color: '#0A8F60' }}>
          {badge}
        </span>
      )}
      <svg width="16" height="16" viewBox="0 0 24 24" stroke="#B0B2BB" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  )
}

// ── Info row (non-tappable) ────────────────────────────────────────────────────
function InfoRow({ label, value, last }) {
  return (
    <div
      className="flex items-center justify-between px-[19px] py-[13px]"
      style={{ borderTop: BORDER }}
    >
      <span className="text-[13.5px] font-semibold" style={{ color: '#888A93' }}>{label}</span>
      <span className="text-[13.5px] font-bold" style={{ color: '#0E0F13' }}>{value}</span>
    </div>
  )
}

// ── PIN Setup ──────────────────────────────────────────────────────────────────
function PinSetup({ onDone }) {
  const [step, setStep] = useState('set')
  const [first, setFirst] = useState([])
  const [second, setSecond] = useState([])
  const [error, setError] = useState('')
  const current = step === 'set' ? first : second
  const setter  = step === 'set' ? setFirst : setSecond

  function press(key) {
    if (key === '') return
    if (key === '⌫') { setter(d => d.slice(0, -1)); setError(''); return }
    if (current.length >= 4) return
    const next = [...current, key]
    setter(next)
    if (next.length === 4) {
      if (step === 'set') {
        setTimeout(() => setStep('confirm'), 200)
      } else {
        if (next.join('') === first.join('')) {
          localStorage.setItem('flux_pin', next.join(''))
          onDone()
        } else {
          setError('Los PINs no coinciden')
          setSecond([])
        }
      }
    }
  }

  const dots = step === 'set' ? first : second

  return (
    <div className="flex flex-col items-center">
      <p className="text-[13px] font-semibold mb-6" style={{ color: '#888A93' }}>
        {step === 'set' ? 'Ingresá un PIN de 4 dígitos' : 'Confirmá tu PIN'}
      </p>

      <div className="flex gap-4 mb-6">
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className="w-3 h-3 rounded-full border-2 transition-all duration-150"
            style={{
              borderColor: '#0E0F13',
              background: dots[i] !== undefined ? '#0E0F13' : 'transparent'
            }}
          />
        ))}
      </div>

      {error && <p className="text-xs font-semibold mb-4" style={{ color: '#E5484D' }}>{error}</p>}

      <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
        {KEYS.map((key, idx) => (
          <button
            key={idx}
            onClick={() => press(key)}
            className="h-14 rounded-2xl text-xl font-bold transition-all duration-100 active:scale-95"
            style={key === ''
              ? {}
              : key === '⌫'
              ? { color: '#888A93' }
              : { background: '#F0F0F4', color: '#0E0F13' }
            }
          >
            {key}
          </button>
        ))}
      </div>

      {localStorage.getItem('flux_pin') && (
        <button
          onClick={() => { localStorage.removeItem('flux_pin'); onDone() }}
          className="text-[12px] font-semibold underline underline-offset-2 mt-2"
          style={{ color: '#E5484D' }}
        >
          Eliminar PIN
        </button>
      )}
    </div>
  )
}
