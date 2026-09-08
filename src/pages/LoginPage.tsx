import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'אימייל או סיסמה שגויים.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-card p-8 shadow-xl">
        <h1 className="mb-1 text-2xl font-semibold text-slate-100">התחברות</h1>
        <p className="mb-6 text-sm text-slate-400">ניהול אירועים ומשימות</p>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}

        <label className="mb-3 block text-sm text-slate-300">
          אימייל
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
          />
        </label>

        <label className="mb-6 block text-sm text-slate-300">
          סיסמה
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-white shadow hover:bg-sky-400 disabled:opacity-50"
        >
          {isSubmitting ? 'מתחבר...' : 'התחברות'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          אין לך חשבון?{' '}
          <Link to="/register" className="text-sky-400 hover:underline">
            הרשמה
          </Link>
        </p>
      </form>
    </div>
  )
}
