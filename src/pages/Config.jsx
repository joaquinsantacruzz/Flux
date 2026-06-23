import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function Config() {
  const { session, logout } = useAuth()
  const email = session?.user?.email || ''
  const hasPin = !!localStorage.getItem('flux_pin')
  const [showPinModal, setShowPinModal] = useState(false)

  return (
    <div className="page-container animate-fade-up">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      {/* Perfil */}
      <div className="card mb-4">
        <p className="section-title">Cuenta</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-flux-black text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
            {email[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{email}</p>
            <p className="text-xs text-flux-gray">Usuario activo</p>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="card mb-4">
        <p className="section-title">Seguridad</p>
        <button
          onClick={() => setShowPinModal(true)}
          className="flex items-center justify-between w-full py-1 active:opacity-60 transition-opacity"
        >
          <div>
            <p className="text-sm font-medium">PIN de seguridad</p>
            <p className="text-xs text-flux-gray">{hasPin ? 'PIN configurado' : 'Sin PIN'}</p>
          </div>
          <span className="text-flux-gray">›</span>
        </button>
      </div>

      {/* Acerca de */}
      <div className="card mb-8">
        <p className="section-title">Acerca de</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-flux-gray">Versión</span><span>0.1.0</span></div>
          <div className="flex justify-between"><span className="text-flux-gray">Modo</span><span>PWA</span></div>
          <div className="flex justify-between"><span className="text-flux-gray">Almacenamiento</span><span>Supabase</span></div>
        </div>
      </div>

      <button onClick={logout} className="btn-danger">
        Cerrar sesión
      </button>

      {showPinModal && (
        <Modal title={hasPin ? 'Cambiar PIN' : 'Configurar PIN'} onClose={() => setShowPinModal(false)}>
          <PinSetup onDone={() => setShowPinModal(false)} />
        </Modal>
      )}
    </div>
  )
}

function PinSetup({ onDone }) {
  const [step, setStep] = useState('set') // 'set' | 'confirm'
  const [first, setFirst] = useState([])
  const [second, setSecond] = useState([])
  const [error, setError] = useState('')
  const current = step === 'set' ? first : second
  const setter = step === 'set' ? setFirst : setSecond

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

  function removePin() {
    localStorage.removeItem('flux_pin')
    onDone()
  }

  const dots = step === 'set' ? first : second

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-flux-gray mb-6">
        {step === 'set' ? 'Ingresa un PIN de 4 dígitos' : 'Confirma tu PIN'}
      </p>

      <div className="flex gap-4 mb-8">
        {[0,1,2,3].map(i => (
          <div key={i} className={`pin-dot ${dots[i] !== undefined ? 'pin-dot-filled' : ''}`} />
        ))}
      </div>

      {error && <p className="text-xs text-flux-red mb-4">{error}</p>}

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-4">
        {KEYS.map((key, idx) => (
          <button
            key={idx}
            onClick={() => press(key)}
            className={`h-14 rounded-2xl text-xl font-medium transition-all duration-100 active:scale-95
              ${key === '' ? '' : key === '⌫'
                ? 'text-flux-gray hover:bg-flux-light'
                : 'bg-flux-light hover:bg-flux-border text-flux-black'
              }`}
          >
            {key}
          </button>
        ))}
      </div>

      {localStorage.getItem('flux_pin') && (
        <button onClick={removePin} className="text-xs text-flux-red underline underline-offset-2 mt-2">
          Eliminar PIN
        </button>
      )}
    </div>
  )
}
