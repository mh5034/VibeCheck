export default function PostCardSkeleton() {
  return (
    <div className="w-full rounded-xl border border-purple-800/60 bg-slate-950 px-3 py-2.5 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Sentiment */}
        <div className="h-5 w-24 rounded bg-slate-700" />

        {/* Topic */}
        <div className="h-4 w-20 rounded bg-slate-700" />

        {/* Date */}
        <div className="ml-auto h-4 w-20 rounded bg-slate-700" />
      </div>

      {/* Post content */}
      <div className="mt-2 space-y-2">
        <div className="h-4 w-full rounded bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-800" />
      </div>
    </div>
  );
}