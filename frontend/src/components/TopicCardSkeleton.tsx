export default function TopicCardSkeleton() {
  return (
    <div className="w-full p-3 rounded-xl bg-slate-950 border border-purple-800/60 animate-pulse">
      {/* Topic title + emoji */}
      <div className="flex justify-between items-start gap-3">
        <div className="h-6 w-1/2 rounded bg-slate-700 ml-1" />
        <div className="h-7 w-7 rounded bg-slate-700 mr-1" />
      </div>

      {/* Vibe count + score */}
      <div className="mt-2 flex justify-between items-center gap-3">
        <div className="h-4 w-16 rounded bg-slate-800 ml-1" />
        <div className="h-4 w-28 rounded bg-slate-800 mr-1" />
      </div>
    </div>
  );
}
