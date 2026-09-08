export function Pagination({
  pageNumber,
  totalPages,
  onChange,
}: {
  pageNumber: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        disabled={pageNumber <= 1}
        onClick={() => onChange(pageNumber - 1)}
        className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:enabled:bg-slate-800 disabled:opacity-40"
      >
        הקודם
      </button>
      <span className="text-sm text-slate-400">
        עמוד {pageNumber} מתוך {totalPages}
      </span>
      <button
        disabled={pageNumber >= totalPages}
        onClick={() => onChange(pageNumber + 1)}
        className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:enabled:bg-slate-800 disabled:opacity-40"
      >
        הבא
      </button>
    </div>
  )
}
