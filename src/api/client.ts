import axios, { type AxiosError } from 'axios'
import type { ApiProblemDetails, UserRole } from '../types/api'

const AUTH_STORAGE_KEY = 'pm2_auth'

export interface StoredAuth {
  token: string
  userId: number
  name: string
  email: string
  role: UserRole
}

export function getStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function setStoredAuth(auth: StoredAuth | null) {
  if (auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080/api'

export const apiClient = axios.create({ baseURL })

apiClient.interceptors.request.use((config) => {
  const auth = getStoredAuth()
  if (auth?.token) {
    config.headers.set('Authorization', `Bearer ${auth.token}`)
  }
  return config
})

// אירוע גלובלי שמאזין לו AuthContext כדי לנקות את המשתמש בלי צימוד ל-Router.
export const AUTH_LOGOUT_EVENT = 'pm2:auth-logout'

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiProblemDetails>) => {
    if (error.response?.status === 401) {
      setStoredAuth(null)
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error: unknown, fallback = 'משהו השתבש. נסו שוב.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiProblemDetails | undefined
    return data?.detail || data?.title || fallback
  }
  return fallback
}
