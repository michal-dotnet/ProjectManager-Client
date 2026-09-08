import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { completeEvent, fetchEvent } from '../api/events'
import { fetchMembers, addMember } from '../api/members'
import { createTask, fetchTasks, takeTask } from '../api/tasks'
import { fetchUsers } from '../api/users'
import { getErrorMessage } from '../api/client'
import type { EventDto, EventMemberDto, TaskDto, UserDto } from '../types/api'
import { EventStatusBadge } from '../components/StatusBadge'
import { MemberAvatarStack } from '../components/MemberAvatar'
import { TaskCard } from '../components/TaskCard'
import { Modal } from '../components/Modal'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const eventId = Number(id)
  const { auth } = useAuth()
  const navigate = useNavigate()

  const [event, setEvent] = useState<EventDto | null>(null)
  const [members, setMembers] = useState<EventMemberDto[]>([])
  const [tasks, setTasks] = useState<TaskDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [takingTaskId, setTakingTaskId] = useState<number | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [eventData, membersData, tasksData] = await Promise.all([
        fetchEvent(eventId),
        fetchMembers(eventId, 1, 200),
        fetchTasks(eventId, 1, 200),
      ])
      setEvent(eventData)
      setMembers(membersData.items)
      setTasks(tasksData.items)
    } catch (err) {
      setError(getErrorMessage(err, 'לא ניתן לטעון את פרטי האירוע.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-8 text-slate-400">טוען...</div>
  }

  if (error && !event) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
        <button onClick={() => navigate('/')} className="mt-4 text-sky-400 hover:underline">
          חזרה לרשימת האירועים
        </button>
      </div>
    )
  }

  if (!event) return null

  const isCreator = auth?.userId === event.createdByUserId
  const isMember = members.some((m) => m.userId === auth?.userId)
  const readOnly = event.status === 'Completed'
  const canTake = isMember && event.status === 'Active'

  const availableTasks = tasks.filter((t) => t.status === 'Available')
  const assignedTasks = tasks.filter((t) => t.status === 'Assigned')

  const handleTake = async (taskId: number) => {
    setTakingTaskId(taskId)
    setError(null)
    try {
      await takeTask(eventId, taskId)
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'לא ניתן היה לקחת את המשימה.'))
    } finally {
      setTakingTaskId(null)
    }
  }

  const handleComplete = async () => {
    if (!window.confirm('לסיים את האירוע? לא ניתן יהיה לבטל פעולה זו.')) return
    setIsCompleting(true)
    setError(null)
    try {
      await completeEvent(eventId)
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'לא ניתן היה לסיים את האירוע.'))
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button onClick={() => navigate('/')} className="mb-4 text-sm text-slate-400 hover:text-slate-200">
        ← כל האירועים
      </button>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div
        className={`mb-8 rounded-2xl border p-6 ${
          readOnly ? 'border-slate-700 bg-slate-900/60' : 'border-surface-border bg-surface-card'
        }`}
      >
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-100">{event.name}</h1>
              <EventStatusBadge status={event.status} />
            </div>
            {event.description && <p className="text-slate-400">{event.description}</p>}
            <div className="mt-2 text-sm text-slate-500">
              {event.startDate && new Date(event.startDate).toLocaleDateString('he-IL')}
              {event.startDate && event.endDate && ' – '}
              {event.endDate && new Date(event.endDate).toLocaleDateString('he-IL')}
            </div>
          </div>

          {isCreator && !readOnly && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAddMember(true)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                + הוסף חבר
              </button>
              <button
                onClick={() => setShowAddTask(true)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                + הוסף משימה
              </button>
              {event.status === 'Active' && (
                <button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isCompleting ? 'מסיים...' : 'סיום אירוע'}
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-500">חברי האירוע</p>
          <MemberAvatarStack names={members.map((m) => m.userName)} />
        </div>
      </div>

      {readOnly && (
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-slate-400">
          האירוע הושלם - התצוגה במצב Read-Only בלבד.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-400">
            משימות פנויות ({availableTasks.length})
          </h2>
          <div className="space-y-3">
            {availableTasks.length === 0 && <p className="text-sm text-slate-500">אין משימות פנויות כרגע.</p>}
            {availableTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                canTake={canTake}
                readOnly={readOnly}
                onTake={handleTake}
                isTaking={takingTaskId === task.id}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-400">
            משימות בביצוע ({assignedTasks.length})
          </h2>
          <div className="space-y-3">
            {assignedTasks.length === 0 && <p className="text-sm text-slate-500">אין משימות בביצוע כרגע.</p>}
            {assignedTasks.map((task) => (
              <TaskCard key={task.id} task={task} canTake={false} readOnly={readOnly} onTake={handleTake} isTaking={false} />
            ))}
          </div>
        </div>
      </div>

      {showAddMember && (
        <AddMemberModal
          eventId={eventId}
          existingUserIds={members.map((m) => m.userId)}
          onClose={() => setShowAddMember(false)}
          onAdded={() => {
            setShowAddMember(false)
            load()
          }}
        />
      )}

      {showAddTask && (
        <AddTaskModal
          eventId={eventId}
          onClose={() => setShowAddTask(false)}
          onAdded={() => {
            setShowAddTask(false)
            load()
          }}
        />
      )}
    </div>
  )
}

function AddMemberModal({
  eventId,
  existingUserIds,
  onClose,
  onAdded,
}: {
  eventId: number
  existingUserIds: number[]
  onClose: () => void
  onAdded: () => void
}) {
  const [users, setUsers] = useState<UserDto[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoadingUsers(true)
    fetchUsers(1, 200)
      .then((data) => {
        if (cancelled) return
        const available = data.items.filter((u) => !existingUserIds.includes(u.id))
        setUsers(available)
        if (available.length > 0) setSelectedUserId(String(available[0].id))
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'לא ניתן היה לטעון את רשימת המשתמשים.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUsers(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return
    setError(null)
    setIsSubmitting(true)
    try {
      await addMember(eventId, { userId: Number(selectedUserId) })
      onAdded()
    } catch (err) {
      setError(getErrorMessage(err, 'לא ניתן היה להוסיף את המשתמש.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="הוספת חבר לאירוע" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}

        {isLoadingUsers ? (
          <p className="mb-4 text-sm text-slate-400">טוען משתמשים...</p>
        ) : users.length === 0 ? (
          <p className="mb-4 text-sm text-slate-400">כל המשתמשים הקיימים כבר חברים באירוע הזה.</p>
        ) : (
          <label className="mb-4 block text-sm text-slate-300">
            בחרו משתמש
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) · {u.role === 'Manager' ? 'מנהל' : 'עובד'}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isLoadingUsers || users.length === 0}
          className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-white shadow hover:bg-sky-400 disabled:opacity-50"
        >
          {isSubmitting ? 'מוסיף...' : 'הוסף'}
        </button>
      </form>
    </Modal>
  )
}

function AddTaskModal({ eventId, onClose, onAdded }: { eventId: number; onClose: () => void; onAdded: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await createTask(eventId, { title, description: description || undefined })
      onAdded()
    } catch (err) {
      setError(getErrorMessage(err, 'לא ניתן היה ליצור את המשימה.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="משימה חדשה" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}
        <label className="mb-3 block text-sm text-slate-300">
          כותרת
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
          />
        </label>
        <label className="mb-4 block text-sm text-slate-300">
          תיאור
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
            rows={3}
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-white shadow hover:bg-sky-400 disabled:opacity-50"
        >
          {isSubmitting ? 'יוצר...' : 'צור משימה'}
        </button>
      </form>
    </Modal>
  )
}
