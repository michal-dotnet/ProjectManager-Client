import type { TaskDto } from '../types/api'
import { TaskStatusBadge } from './StatusBadge'

export function TaskCard({
  task,
  canTake,
  readOnly,
  onTake,
  isTaking,
}: {
  task: TaskDto
  canTake: boolean
  readOnly: boolean
  onTake: (taskId: number) => void
  isTaking: boolean
}) {
  const isAvailable = task.status === 'Available'

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition ${
        isAvailable ? 'border-sky-500/40 bg-sky-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
      } ${readOnly ? 'opacity-60' : ''}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="font-medium text-slate-100">{task.title}</h4>
        <TaskStatusBadge status={task.status} />
      </div>

      {task.description && <p className="mb-3 text-sm text-slate-400">{task.description}</p>}

      {task.status === 'Assigned' && (
        <div className="flex items-center gap-2 text-sm text-emerald-300">
          <span aria-hidden>🔒</span>
          <span>בידי {task.assignedToUserName ?? `משתמש #${task.assignedToUserId}`}</span>
        </div>
      )}

      {isAvailable && !readOnly && (
        <button
          disabled={!canTake || isTaking}
          onClick={() => onTake(task.id)}
          className="mt-2 w-full rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
          title={canTake ? undefined : 'רק חברי האירוע יכולים לקחת משימות, וכשהאירוע פעיל (Active).'}
        >
          {isTaking ? 'לוקח...' : 'Take Task'}
        </button>
      )}
    </div>
  )
}
