import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAllEvents } from '../api/events'
import { getErrorMessage } from '../api/client'
import type { EventDto } from '../types/api'

// עמוד עצמאי לגמרי: לא נוגע בשום קובץ/קומפוננטה קיימים (חוץ מקישור ניווט
// קטן ב-Navbar.tsx), וקורא מידע רק דרך ה-API הקיים (GET /events) - בלי שום
// שינוי ב-Backend. הצבע לכל אירוע מחושב כאן בצד ה-Client לפי ה-Id שלו, כדי
// שלא צריך לשמור שום דבר נוסף במסד הנתונים.

const WEEKDAY_LABELS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

// פלטת צבעים קבועה - Tailwind צריך class names מלאים וליטרליים (לא בנויים
// דינמית) כדי לכלול אותם ב-Build, אז זו רשימה סגורה מראש ולא תבנית מחרוזת.
const PALETTE = [
  'bg-sky-500/25 border-sky-500/60 text-sky-100',
  'bg-emerald-500/25 border-emerald-500/60 text-emerald-100',
  'bg-amber-500/25 border-amber-500/60 text-amber-100',
  'bg-rose-500/25 border-rose-500/60 text-rose-100',
  'bg-violet-500/25 border-violet-500/60 text-violet-100',
  'bg-cyan-500/25 border-cyan-500/60 text-cyan-100',
  'bg-fuchsia-500/25 border-fuchsia-500/60 text-fuchsia-100',
  'bg-lime-500/25 border-lime-500/60 text-lime-100',
]

function colorFor(eventId: number) {
  return PALETTE[eventId % PALETTE.length]
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

// בונה את רשת השבועות המלאה של החודש (כולל ימי "ריפוד" מהחודש הקודם/הבא
// שמשלימים שבוע מלא, בדיוק כמו בכל לוח שנה רגיל).
function buildMonthGrid(monthDate: Date): Date[][] {
  const firstOfMonth = startOfMonth(monthDate)
  const lastOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(gridStart.getDate() - gridStart.getDay())

  const gridEnd = new Date(lastOfMonth)
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()))

  const weeks: Date[][] = []
  const cursor = new Date(gridStart)
  while (cursor <= gridEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

// טווח תאריכים "נקי" (בלי שעה) לאירוע - עם נפילה חזרה לתאריך היחיד הקיים
// אם רק אחד מ-StartDate/EndDate מוגדר, ודילוג מוחלט על אירועים בלי שום
// תאריך (אין מה להציג עליהם בלוח שנה).
function getEventRange(event: EventDto): { start: Date; end: Date } | null {
  const rawStart = event.startDate ?? event.endDate
  const rawEnd = event.endDate ?? event.startDate
  if (!rawStart || !rawEnd) return null

  const s = new Date(rawStart)
  const e = new Date(rawEnd)
  const start = new Date(s.getFullYear(), s.getMonth(), s.getDate())
  const end = new Date(e.getFullYear(), e.getMonth(), e.getDate())
  return start <= end ? { start, end } : { start: end, end: start }
}

interface PositionedEvent {
  event: EventDto
  colStart: number
  colEnd: number
  lane: number
}

// אלגוריתם "חדרי ישיבות" קלאסי: לכל אירוע שחופף לשבוע הזה, מוצאת את ה-Lane
// (שורה) הראשונה שבה הוא לא מתנגש עם אירוע אחר שכבר הוצב בה - כדי שכמה
// אירועים חופפים באותו שבוע יוצגו זה מתחת לזה, לא זה על זה.
function layoutWeek(week: Date[], events: EventDto[]): PositionedEvent[] {
  const weekStart = week[0]
  const weekEnd = week[6]
  const dayMs = 86_400_000

  const overlapping = events
    .map((event) => {
      const range = getEventRange(event)
      if (!range || range.end < weekStart || range.start > weekEnd) return null
      const colStart = Math.max(0, Math.round((range.start.getTime() - weekStart.getTime()) / dayMs))
      const colEnd = Math.min(6, Math.round((range.end.getTime() - weekStart.getTime()) / dayMs))
      return { event, colStart, colEnd }
    })
    .filter((x): x is { event: EventDto; colStart: number; colEnd: number } => x !== null)
    .sort((a, b) => a.colStart - b.colStart || b.colEnd - b.colStart - (a.colEnd - a.colStart))

  const laneEnds: number[] = []
  const positioned: PositionedEvent[] = []
  for (const item of overlapping) {
    let lane = laneEnds.findIndex((end) => end < item.colStart)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(item.colEnd)
    } else {
      laneEnds[lane] = item.colEnd
    }
    positioned.push({ ...item, lane })
  }
  return positioned
}

export function CalendarPage() {
  const navigate = useNavigate()
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()))
  const [allEvents, setAllEvents] = useState<EventDto[]>([])
  const [showCompleted, setShowCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchAllEvents()
      .then((events) => {
        if (!cancelled) setAllEvents(events)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'לא ניתן לטעון את האירועים.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const weeks = useMemo(() => buildMonthGrid(monthDate), [monthDate])

  const gridEvents = useMemo(() => {
    const gridStart = weeks[0][0]
    const gridEnd = weeks[weeks.length - 1][6]
    return allEvents.filter((event) => {
      if (!showCompleted && event.status === 'Completed') return false
      const range = getEventRange(event)
      return range !== null && range.end >= gridStart && range.start <= gridEnd
    })
  }, [allEvents, weeks, showCompleted])

  const monthLabel = monthDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
  const today = new Date()

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-100">לוח שנה</h1>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-sky-500"
          />
          הצג גם אירועים שהושלמו
        </label>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-400">טוען...</p>
      ) : (
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setMonthDate((d) => addMonths(d, -1))}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              החודש הקודם
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-100">{monthLabel}</h2>
              <button
                onClick={() => setMonthDate(startOfMonth(new Date()))}
                className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800"
              >
                היום
              </button>
            </div>
            <button
              onClick={() => setMonthDate((d) => addMonths(d, 1))}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              החודש הבא
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="py-1 text-center text-xs font-medium text-slate-500">
                {label}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => {
            const positioned = layoutWeek(week, gridEvents)
            const laneCount = Math.max(1, ...positioned.map((p) => p.lane + 1))
            return (
              <div key={weekIndex} className="mb-1.5">
                <div className="grid grid-cols-7 gap-1">
                  {week.map((day) => {
                    const isCurrentMonth = day.getMonth() === monthDate.getMonth()
                    const isToday = isSameDay(day, today)
                    return (
                      <div
                        key={day.toISOString()}
                        className={[
                          'flex h-7 items-center justify-center rounded-lg text-xs',
                          isCurrentMonth ? 'text-slate-300' : 'text-slate-600',
                          isToday ? 'border border-sky-400 bg-sky-500/20 font-semibold text-sky-200' : '',
                        ].join(' ')}
                      >
                        {day.getDate()}
                      </div>
                    )
                  })}
                </div>
                {positioned.length > 0 && (
                  <div
                    className="mt-1 grid grid-cols-7 gap-x-1 gap-y-1"
                    style={{ gridTemplateRows: `repeat(${laneCount}, 22px)` }}
                  >
                    {positioned.map((p) => (
                      <button
                        key={`${p.event.id}-${weekIndex}`}
                        title={p.event.name}
                        onClick={() => navigate(`/events/${p.event.id}`)}
                        style={{ gridColumn: `${p.colStart + 1} / ${p.colEnd + 2}`, gridRow: p.lane + 1 }}
                        className={`truncate rounded border px-2 text-right text-[11px] font-medium transition hover:brightness-125 ${colorFor(
                          p.event.id
                        )}`}
                      >
                        {p.event.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-surface-border pt-4">
            {gridEvents.length === 0 ? (
              <span className="text-xs text-slate-500">אין אירועים להצגה בחודש הזה.</span>
            ) : (
              gridEvents.map((event) => (
                <span key={event.id} className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                  <span className={`h-2.5 w-2.5 rounded-full border ${colorFor(event.id)}`} />
                  {event.name}
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
