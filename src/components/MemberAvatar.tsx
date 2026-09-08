const COLORS = ['bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-rose-500']

function colorForName(name: string) {
  const code = name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return COLORS[code % COLORS.length]
}

export function MemberAvatar({ name, title }: { name: string; title?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div
      title={title ?? name}
      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface text-sm font-semibold text-white ${colorForName(name)}`}
    >
      {initial}
    </div>
  )
}

export function MemberAvatarStack({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <p className="text-sm text-slate-500">אין עדיין חברי אירוע.</p>
  }
  return (
    <div className="flex -space-x-2 space-x-reverse">
      {names.map((name, index) => (
        <MemberAvatar key={`${name}-${index}`} name={name} />
      ))}
    </div>
  )
}
