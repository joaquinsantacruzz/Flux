import { createContext, useContext, useState, useEffect } from 'react'
import { loadLocalSession, localSignOut } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pinVerified, setPinVerified] = useState(false)

  useEffect(() => {
    const s = loadLocalSession()
    setSession(s)
    setLoading(false)
  }, [])

  function login(sessionData) {
    setSession(sessionData)
    setPinVerified(false)
  }

  function logout() {
    localSignOut()
    setSession(null)
    setPinVerified(false)
  }

  return (
    <AuthContext.Provider value={{ session, loading, login, logout, pinVerified, setPinVerified }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
