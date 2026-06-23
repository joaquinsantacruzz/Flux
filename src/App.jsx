import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import PinLock from './components/PinLock'
import Inicio from './pages/Inicio'
import Movimientos from './pages/Movimientos'
import Estadisticas from './pages/Estadisticas'
import Metas from './pages/Metas'
import Deudas from './pages/Deudas'
import Config from './pages/Config'
import BottomNav from './components/BottomNav'

function AppRoutes() {
  const { session, loading, pinVerified } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-flux-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Login />

  const hasPin = !!localStorage.getItem('flux_pin')
  if (hasPin && !pinVerified) return <PinLock />

  return (
    <div className="bg-white min-h-dvh">
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="/deudas" element={<Deudas />} />
        <Route path="/config" element={<Config />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
