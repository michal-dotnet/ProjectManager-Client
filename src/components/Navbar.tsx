import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  if (!auth) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-surface-border bg-surface-card/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold text-slate-100">
            project<span className="text-sky-400">Manager2</span>
          </Link>
          <Link to="/calendar" className="text-sm text-slate-300 hover:text-sky-400">
            לוח שנה
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
            {auth.name} · <span className="text-sky-400">{auth.role === 'Manager' ? 'מנהל אירועים' : 'עובד'}</span>
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            התנתקות
          </button>
        </div>
      </div>
    </header>
  )
}
