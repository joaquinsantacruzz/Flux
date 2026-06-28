import { useState } from 'react'
import { loginWithCedula, registerUser } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [mode, setMode] = useState('login')
  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function switchMode(m) {
    setMode(m)
    setError('')
    setSuccess('')
    setCedula('')
    setNombre('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await registerUser(cedula, password, nombre, email)
        setSuccess('¡Cuenta creada! Ya podés iniciar sesión con tu cédula.')
        switchMode('login')
      } else {
        const data = await loginWithCedula(cedula, password)
        login(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: '#E7E8EE' }}>
      {/* Hero top */}
      <div className="flex flex-col items-center pt-16 pb-10 px-6">
        <div
          className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center mb-5"
          style={{ background: 'linear-gradient(135deg,#0CAE73,#0A8F60)', boxShadow: '0 8px 24px -6px rgba(12,174,115,.5)' }}
        >
          <span className="text-white text-[26px] font-extrabold" style={{ letterSpacing: '-1px' }}>F</span>
        </div>
        <h1 className="text-[28px] font-extrabold text-center" style={{ letterSpacing: '-.6px', color: '#0E0F13' }}>
          {isLogin ? 'Bienvenido a Flux' : 'Crear cuenta'}
        </h1>
        <p className="text-[13.5px] font-semibold mt-1 text-center" style={{ color: '#888A93' }}>
          {isLogin ? 'Ingresá con tu cédula y contraseña' : 'Completá tus datos para registrarte'}
        </p>
      </div>

      {/* Card formulario */}
      <div className="flex-1 bg-white rounded-t-[28px] px-6 pt-8 pb-10 shadow-[0_-4px_24px_rgba(14,15,19,.08)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto">

          {!isLogin && (
            <div>
              <label className="label">Nombre completo</label>
              <input
                type="text" required
                value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
                className="input-field"
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="label">Correo (Gmail)</label>
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="nombre@gmail.com"
                className="input-field"
                autoComplete="email"
              />
            </div>
          )}

          <div>
            <label className="label">Número de cédula</label>
            <input
              type="text" required
              value={cedula} onChange={e => setCedula(e.target.value)}
              placeholder="Ej: 4.123.456"
              className="input-field"
              inputMode="numeric"
              autoComplete="username"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label" style={{ margin: 0 }}>Contraseña</label>
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="text-[11px] font-semibold"
                style={{ color: '#888A93' }}
              >
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              type={showPass ? 'text' : 'password'} required minLength={6}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="input-field"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="label">Confirmar contraseña</label>
              <input
                type={showPass ? 'text' : 'password'} required minLength={6}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repetí la contraseña"
                className="input-field"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-[12px] px-3 py-2.5" style={{ background: '#FDEAEA' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" stroke="#E5484D" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[1px]">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <p className="text-[12px] font-semibold" style={{ color: '#C93A3E' }}>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-[12px] px-3 py-2.5" style={{ background: '#E6F6EF' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" stroke="#0A8F60" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[1px]">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <p className="text-[12px] font-semibold" style={{ color: '#0A8F60' }}>{success}</p>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="btn-primary mt-2"
            style={{ background: loading ? '#888A93' : 'linear-gradient(135deg,#0CAE73,#0A8F60)' }}
          >
            {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Crear cuenta'}
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: '#E5E5EA' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#B0B2BB' }}>o</span>
            <div className="flex-1 h-px" style={{ background: '#E5E5EA' }} />
          </div>

          <button
            type="button"
            onClick={() => switchMode(isLogin ? 'signup' : 'login')}
            className="w-full py-3 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: '#F0F0F4', color: '#0E0F13' }}
          >
            {isLogin ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
