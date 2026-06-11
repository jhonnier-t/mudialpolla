export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="card animate-pulse">
        <div className="mb-4 h-5 w-48 rounded bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-10 rounded-lg bg-slate-200" />
          <div className="h-10 rounded-lg bg-slate-200" />
          <div className="h-10 rounded-lg bg-slate-200" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-4 w-64 rounded bg-slate-200" />
              <div className="h-3 w-48 rounded bg-slate-200" />
            </div>
            <div className="h-10 w-44 rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
