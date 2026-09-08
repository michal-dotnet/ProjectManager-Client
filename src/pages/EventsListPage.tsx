import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { createEvent, fetchEvents } from '../api/events'
import { getErrorMessage } from '../api/client'
import type { EventDto } from '../types/api'
import { EventCard } from '../components/EventCard'
import { Pagination } from '../components/Pagination'
import { Modal } from '../components/Modal'

export function EventsListPage() {
  const { isManager } = useAuth()
  const [events, setEvents] = useState<EventDto[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = async (page: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchEvents(page, 12)
      setEvents(result.items)
      setTotalPages(result.totalPages || 1)
      setPageNumber(result.pageNumber)
    } catch (err) {
      setError(getErrorMessage(err, 'לא ניתן לטעון את רשימת האירועים.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">האירועים שלי</h1>
        {isManager && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400"
          >
            + אירוע חדש
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-400">טוען...</p>
      ) : events.length === 0 ? (
        <p className="text-slate-400">
          {isManager ? 'עדיין לא יצרת אירועים. לחצי על "+ אירוע חדש" כדי להתחיל.' : 'עדיין לא צורפת לאף אירוע.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <Pagination pageNumber={pageNumber} totalPages={totalPages} onChange={load} />

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            load(1)
          }}
        />
      )}
    </div>
  )
}

function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await createEvent({
        name,
        description: description || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      })
      onCreated()
    } catch (err) {
      setError(getErrorMessage(err, 'יצירת האירוע נכשלה.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="אירוע חדש" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}
        <label className="mb-3 block text-sm text-slate-300">
          שם האירוע
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
          />
        </label>
        <label className="mb-3 block text-sm text-slate-300">
          תיאור
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
            rows={3}
          />
        </label>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <label className="block text-sm text-slate-300">
            תאריך התחלה
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
            />
          </label>
          <label className="block text-sm text-slate-300">
            תאריך סיום
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-white shadow hover:bg-sky-400 disabled:opacity-50"
        >
          {isSubmitting ? 'יוצר...' : 'צור אירוע'}
        </button>
      </form>
    </Modal>
  )
}
