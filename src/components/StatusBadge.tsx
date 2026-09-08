import type { EventStatus, TaskStatusEnum } from '../types/api'

const EVENT_STYLES: Record<EventStatus, string> = {
  Draft: 'bg-slate-700 text-slate-200',
  Active: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
  Completed: 'bg-slate-800 text-slate-400 border border-slate-600',
}

const EVENT_LABELS: Record<EventStatus, string> = {
  Draft: 'טיוטה',
  Active: 'פעיל',
  Completed: 'הושלם',
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${EVENT_STYLES[status]}`}>
      {EVENT_LABELS[status]}
    </span>
  )
}

const TASK_STYLES: Record<TaskStatusEnum, string> = {
  Available: 'bg-sky-500/10 text-sky-300 border border-sky-500/40',
  Assigned: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
}

const TASK_LABELS: Record<TaskStatusEnum, string> = {
  Available: 'פנויה',
  Assigned: 'בביצוע',
}

export function TaskStatusBadge({ status }: { status: TaskStatusEnum }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TASK_STYLES[status]}`}>
      {TASK_LABELS[status]}
    </span>
  )
}
