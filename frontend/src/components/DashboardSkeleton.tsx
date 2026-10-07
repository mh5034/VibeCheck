import { useNavigate } from "react-router-dom";
import PostCardSkeleton from "@/components/PostCardSkeleton";

export default function DashboardSkeleton() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-linear-to-br from-violet-950 to-black px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back
        </button>
        {/* Dashboard header */}
        <div className="bg-slate-950 border border-purple-800/60 rounded-2xl p-6 mb-6 animate-pulse">
          <div className="h-7 w-40 rounded bg-slate-700 mb-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-purple-800/60 rounded-xl p-4">
              <div className="h-8 w-12 rounded bg-slate-700 mx-auto mb-2" />
              <div className="h-4 w-20 rounded bg-slate-800 mx-auto" />
            </div>

            <div className="border border-purple-800/60 rounded-xl p-4">
              <div className="h-8 w-12 rounded bg-slate-700 mx-auto mb-2" />
              <div className="h-4 w-24 rounded bg-slate-800 mx-auto" />
            </div>
          </div>
        </div>

        {/* Your Vibes heading */}
        <div className="h-6 w-28 rounded bg-slate-700 animate-pulse mb-3" />

        {/* Post cards */}
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
