import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AUTH_LOGOUT_EVENT, getStoredAuth, setStoredAuth, type StoredAuth } from '../api/client'
import * as authApi from '../api/auth'
import type { LoginPayload, RegisterPayload } from '../types/api'

interface AuthContextValue {
  auth: StoredAuth | null
  isAuthenticated: boolean
  isManager: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => getStoredAuth())

  useEffect(() => {
    const handleLogout = () => setAuth(null)
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout)
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout)
  }, [])

  const login = async (payload: LoginPayload) => {
    const response = await authApi.login(payload)
    const stored: StoredAuth = {
      token: response.token,
      userId: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
    }
    setStoredAuth(stored)
    setAuth(stored)
  }

  const register = async (payload: RegisterPayload) => {
    const response = await authApi.register(payload)
    const stored: StoredAuth = {
      token: response.token,
      userId: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
    }
    setStoredAuth(stored)
    setAuth(stored)
  }

  const logout = () => {
    setStoredAuth(null)
    setAuth(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      isAuthenticated: !!auth,
      isManager: auth?.role === 'Manager',
      login,
      register,
      logout,
    }),
    [auth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
