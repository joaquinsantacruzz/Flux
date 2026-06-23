import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function PinLock() {
  const { setPinVerified, logout } = useAuth()
  const [digits, setDigits] = useState([])
  const [error, setError] = useState(false)

  function press(key) {
    if (key === '') return
    if (key === '⌫') {
      setDigits(d => d.slice(0, -1))
      setError(false)
      return
    }
    if (digits.length >= 4) return
    const next = [...digits, key]
    setDigits(next)
    if (next.length === 4) {
      const stored = localStorage.getItem('flux_pin')
      if (next.join('') === stored) {
        setPinVerified(true)
      } else {
        setError(true)
        setTimeout(() => { setDigits([]); setError(false) }, 600)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-white px-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-1 tracking-tight">Flux</h1>
      <p className="text-flux-gray text-sm mb-10">Ingresa tu PIN de seguridad</p>

      {/* Dots */}
      <div className="flex gap-4 mb-10">
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`pin-dot ${digits[i] !== undefined ? 'pin-dot-filled' : ''} ${error ? 'border-flux-red bg-flux-red' : ''}`}
          />
        ))}
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {KEYS.map((key, idx) => (
          <button
            key={idx}
            onClick={() => press(key)}
            className={`h-16 rounded-2xl text-xl font-medium transition-all duration-100 active:scale-95
              ${key === '' ? '' : key === '⌫'
                ? 'text-flux-gray hover:bg-flux-light'
                : 'bg-flux-light hover:bg-flux-border text-flux-black'
              }`}
          >
            {key}
          </button>
        ))}
      </div>

      <button
        onClick={logout}
        className="mt-10 text-xs text-flux-gray underline underline-offset-2"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
