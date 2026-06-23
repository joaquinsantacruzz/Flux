import { useState } from 'react'
import { signIn, signUp } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password)
        setSuccess('Cuenta creada. Revisa tu email para confirmarla.')
      } else {
        const data = await signIn(email, password)
        login(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col justify-between min-h-dvh px-6 py-10 max-w-sm mx-auto animate-fade-in">
      {/* Header */}
      <div className="pt-8">
        <div className="w-12 h-12 bg-flux-black rounded-2xl flex items-center justify-center mb-6">
          <span className="text-white text-2xl font-bold">F</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          {mode === 'login' ? 'Bienvenido' : 'Crea tu cuenta'}
        </h1>
        <p className="text-flux-gray text-sm">
          {mode === 'login' ? 'Gestiona tus finanzas personales' : 'Empieza a controlar tus finanzas'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field"
          />
        </div>

        {error && (
          <p className="text-xs text-flux-red bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-xs text-flux-green bg-green-50 rounded-xl px-3 py-2">{success}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <button
          type="button"
          onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
          className="text-sm text-flux-gray text-center"
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </form>

      <p className="text-center text-xs text-flux-border">Flux · Finanzas Personales</p>
    </div>
  )
}
