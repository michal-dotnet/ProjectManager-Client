import { apiClient } from './client'
import type { CreateEventPayload, EventDto, PagedResult, UpdateEventPayload } from '../types/api'

export async function fetchEvents(pageNumber = 1, pageSize = 20) {
  const { data } = await apiClient.get<PagedResult<EventDto>>('/events', {
    params: { pageNumber, pageSize },
  })
  return data
}

// שולפת את כל האירועים של המשתמש (לא רק עמוד אחד) - לשימוש בלוח השנה,
// שצריך את כל האירועים כדי לסנן לפי חודש בצד ה-Client. משתמשת ב-pageSize
// המקסימלי המותר (100) ומביאה עמודים נוספים במקביל אם יש יותר מזה.
export async function fetchAllEvents() {
  const first = await fetchEvents(1, 100)
  if (first.totalPages <= 1) return first.items
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) => fetchEvents(i + 2, 100))
  )
  return [...first.items, ...rest.flatMap((r) => r.items)]
}

export async function fetchEvent(eventId: number) {
  const { data } = await apiClient.get<EventDto>(`/events/${eventId}`)
  return data
}

export async function createEvent(payload: CreateEventPayload) {
  const { data } = await apiClient.post<EventDto>('/events', payload)
  return data
}

export async function updateEvent(eventId: number, payload: UpdateEventPayload) {
  const { data } = await apiClient.put<EventDto>(`/events/${eventId}`, payload)
  return data
}

export async function completeEvent(eventId: number) {
  const { data } = await apiClient.post<EventDto>(`/events/${eventId}/completion`)
  return data
}
