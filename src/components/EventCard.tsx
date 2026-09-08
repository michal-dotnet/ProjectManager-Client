import { Link } from 'react-router-dom'
import type { EventDto } from '../types/api'
import { EventStatusBadge } from './StatusBadge'

export function EventCard({ event }: { event: EventDto }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="block rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm transition hover:border-sky-500/50 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-100">{event.name}</h3>
        <EventStatusBadge status={event.status} />
      </div>
      {event.description && <p className="mb-3 line-clamp-2 text-sm text-slate-400">{event.description}</p>}
      <div className="text-xs text-slate-500">
        {event.startDate && new Date(event.startDate).toLocaleDateString('he-IL')}
        {event.startDate && event.endDate && ' – '}
        {event.endDate && new Date(event.endDate).toLocaleDateString('he-IL')}
      </div>
    </Link>
  )
}
