import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [company, setCompany]   = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    authAPI.me()
      .then(r => setCompany(r.data))
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = (data) => {
    localStorage.setItem('token',   data.access_token)
    localStorage.setItem('api_key', data.api_key)
    setCompany({ name: data.company_name, plan: data.plan, id: data.company_id })
  }

  const logout = () => {
    localStorage.clear()
    setCompany(null)
  }

  const apiKey = localStorage.getItem('api_key') || ''

  return (
    <AuthContext.Provider value={{ company, loading, login, logout, apiKey }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)