function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="mb-4 h-5 w-40 rounded bg-slate-200" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-5 w-20 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortalLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse space-y-2">
        <div className="h-7 w-56 rounded bg-slate-200" />
        <div className="h-4 w-72 rounded bg-slate-200" />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
