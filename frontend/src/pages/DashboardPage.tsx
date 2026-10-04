import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import { useNavigate } from "react-router-dom";
import {
  getDashboard,
  type Dashboard,
} from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleted = (postId: number) => {
    setDashboard((current) => {
      if (!current) return current;
      const posts = current.posts.filter((post) => post.id !== postId);
      const scores = posts.flatMap((post) => post.sentiment_score === null ? [] : [post.sentiment_score]);
      return {
        ...current,
        posts,
        total_posts: posts.length,
        avg_sentiment: scores.length
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 10) / 10
          : null,
      };
    });
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    getDashboard()
      .then(setDashboard)
      .catch((err) => {
        if (err.response?.status == 401) {
          logout(); // clear auth state
          navigate("/auth");
        }
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  if (loading)
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-950 to-black flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  if (!dashboard) return null;

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-violet-950 to-black px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
          >
            ← Back
          </button>
          {/* Header Banner */}
          <div className="bg-slate-950 border border-purple-800/60 rounded-2xl p-6 mb-6">
            <h1 className="text-white text-2xl font-bold mb-4">My Dashboard</h1>

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-purple-800/60 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-white">
                  {dashboard.total_posts}
                </p>
                <p className="text-gray-400 text-sm mt-1">Total Vibes</p>
              </div>
              <div className="bg-slate-950 border border-purple-800/60 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {dashboard.avg_sentiment ?? "N/A"}
                </p>
                <p className="text-gray-400 text-sm mt-1">Avg Sentiment</p>
              </div>
            </div>
          </div>

          {/* User Posts Segment */}
          <h2 className="text-white font-semibold text-lg mb-3">Your Vibes</h2>

          <div className="flex flex-col gap-3">
            {dashboard.posts.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                You haven't posted any vibes yet!
              </div>
            ) : (
              dashboard.posts.map((postItem) => (
                <PostCard
                  key={postItem.id}
                  post={postItem}
                  topic={{ id: postItem.topic_id, name: postItem.topic_name }}
                  onDeleted={handleDeleted}
                />
              ))
            )}
          </div>
        </div>
      </div>

    </>
  );
}
