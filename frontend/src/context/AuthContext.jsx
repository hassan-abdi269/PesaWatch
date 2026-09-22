import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('pesawatch_token') || '')
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me')
      setUser(response.data.data)
    } catch (error) {
      localStorage.removeItem('pesawatch_token')
      setToken('')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, [token])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const authData = response.data.data
    localStorage.setItem('pesawatch_token', authData.token)
    setToken(authData.token)
    setUser(authData.user)
    return response
  }

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload)
    const authData = response.data.data
    localStorage.setItem('pesawatch_token', authData.token)
    setToken(authData.token)
    setUser(authData.user)
    return response
  }

  const logout = () => {
    localStorage.removeItem('pesawatch_token')
    setToken('')
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, token, login, register, logout, isAuthenticated: !!token, loading }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
