import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'
import type { UserRole } from '../types/api'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('Worker')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await register({ name, email, password, role })
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'ההרשמה נכשלה. נסו שוב.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-card p-8 shadow-xl">
        <h1 className="mb-1 text-2xl font-semibold text-slate-100">הרשמה</h1>
        <p className="mb-6 text-sm text-slate-400">יצירת חשבון חדש</p>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}

        <label className="mb-3 block text-sm text-slate-300">
          שם מלא
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
          />
        </label>

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

        <label className="mb-4 block text-sm text-slate-300">
          סיסמה
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
          />
        </label>

        <fieldset className="mb-6">
          <legend className="mb-2 text-sm text-slate-300">איזה תפקיד מתאים לך?</legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('Worker')}
              className={`rounded-lg border px-3 py-2 text-sm ${
                role === 'Worker' ? 'border-sky-500 bg-sky-500/10 text-sky-300' : 'border-slate-700 text-slate-400'
              }`}
            >
              עובד (Worker)
              <div className="mt-1 text-xs opacity-70">מצטרף לאירועים ולוקח משימות</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('Manager')}
              className={`rounded-lg border px-3 py-2 text-sm ${
                role === 'Manager' ? 'border-sky-500 bg-sky-500/10 text-sky-300' : 'border-slate-700 text-slate-400'
              }`}
            >
              מנהל אירועים (Manager)
              <div className="mt-1 text-xs opacity-70">יכול גם ליצור אירועים חדשים</div>
            </button>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-white shadow hover:bg-sky-400 disabled:opacity-50"
        >
          {isSubmitting ? 'נרשם...' : 'הרשמה'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          כבר יש לך חשבון?{' '}
          <Link to="/login" className="text-sky-400 hover:underline">
            התחברות
          </Link>
        </p>
      </form>
    </div>
  )
}
