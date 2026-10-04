import PostCardSkeleton from "@/components/PostCardSkeleton";
import { useNavigate } from "react-router-dom";

export default function TopicPageSkeleton() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-linear-to-br from-violet-950 to-black px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back
        </button>
        {/* Topic Header */}
        <div className="w-full rounded-xl bg-slate-950 border border-purple-800 p-6 mb-6 animate-pulse">
          {/* Topic name */}
          <div className="h-8 w-1/2 rounded bg-slate-700 mb-4" />

          {/* Community vibe */}
          <div className="flex justify-between mb-2">
            <div className="h-4 w-28 rounded bg-slate-700" />
            <div className="h-4 w-14 rounded bg-slate-700" />
          </div>

          {/* Vibe bar */}
          <div className="h-3 w-full rounded-full bg-slate-700" />

          {/* Description */}
          <div className="h-3 w-64 max-w-full rounded bg-slate-800 mt-2" />

          {/* AI Summary */}
          <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
            <div className="h-3 w-24 rounded bg-slate-700 mb-3" />
            <div className="h-4 w-full rounded bg-slate-700 mb-2" />
            <div className="h-4 w-3/4 rounded bg-slate-700" />
          </div>
        </div>

        {/* Post Input */}
        <div className="bg-slate-950 border border-purple-800 rounded-xl p-4 mb-6 animate-pulse">
          <div className="h-4 w-40 rounded bg-slate-700 mb-3" />
          <div className="h-4 w-2/3 rounded bg-slate-800 mb-8" />

          <div className="flex justify-between items-center pt-3 border-t border-slate-800/40">
            <div className="h-3 w-10 rounded bg-slate-700" />
            <div className="h-9 w-24 rounded-lg bg-slate-700" />
          </div>
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
