// frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, type Dashboard } from "../api/client";
import { useAuth } from "../context/AuthContext";

function getSentimentEmoji(score: number | null) {
  if (score === null) return "💬";
  if (score >= 70) return "😊";
  if (score >= 40) return "😐";
  return "😞";
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth"); // redirect if not logged in
      return;
    }
    getDashboard()
      .then(setDashboard)
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  if (!dashboard) return null;

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <h1 className="text-white text-2xl font-bold mb-4">My Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">
                {dashboard.total_posts}
              </p>
              <p className="text-gray-400 text-sm mt-1">Total Vibes</p>
            </div>
            <div className="bg-gray-700 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-400">
                {dashboard.avg_sentiment ?? "N/A"}
              </p>
              <p className="text-gray-400 text-sm mt-1">Avg Sentiment</p>
            </div>
          </div>
        </div>

        {/* Posts */}
        <h2 className="text-white font-semibold text-lg mb-3">Your Vibes</h2>

        <div className="flex flex-col gap-3">
          {dashboard.posts.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              You haven't posted any vibes yet!
            </div>
          ) : (
            dashboard.posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-800 rounded-xl p-4 flex gap-3"
              >
                <span className="text-2xl">
                  {getSentimentEmoji(post.sentiment_score)}
                </span>
                <div className="flex-1">
                  <p className="text-purple-400 text-xs font-semibold mb-1">
                    #{post.topic_name}
                  </p>
                  <p className="text-white text-sm">{post.content}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-500 text-xs">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    {post.sentiment_score !== null && (
                      <span className="text-gray-400 text-xs">
                        vibe: {post.sentiment_score}/100
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
