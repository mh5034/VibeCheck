import { getSentimentEmoji } from "@/lib/sentiment";
import { useEffect, useState } from "react";
import DeleteDialog from "@/components/DeleteDialog";
import { useNavigate } from "react-router-dom";
import {
  deletePost,
  getDashboard,
  type Dashboard,
  type Post,
} from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // Track the specific post targeted for deletion
  const [activeDeletePost, setActiveDeletePost] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!activeDeletePost || !dashboard) return;
    setDeleting(true);
    setError("");

    try {
      await deletePost(activeDeletePost.id);

      // Instantly remove the deleted post from the local UI state array
      setDashboard({
        ...dashboard,
        posts: dashboard.posts.filter((p) => p.id !== activeDeletePost.id),
        total_posts: dashboard.total_posts - 1,
      });

      setActiveDeletePost(null); // Close the dialog
    } catch (err) {
      setError("Could not delete post. Make sure you are the author.");
    } finally {
      setDeleting(false);
    }
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
                <div
                  key={postItem.id}
                  className="bg-slate-950 border border-purple-800/60 rounded-xl p-3 flex gap-3"
                >
                  <span className="text-2xl">
                    {getSentimentEmoji(postItem.sentiment_score)}
                  </span>
                  <div className="flex flex-col justify-between">
                    <p className="text-purple-400 text-xs font-semibold mb-1">
                      #{postItem.topic_name}
                    </p>
                    <p className="text-white text-sm">{postItem.content}</p>
                    <span className="text-gray-500 text-xs mt-2">
                      {new Date(postItem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col justify-between shrink-0 mt-4 ml-auto">
                    <button
                      onClick={() => setActiveDeletePost(postItem)}
                      className="bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-600 hover:text-white active:bg-red-700 rounded-xl text-xs transition-colors duration-200 mt-2"
                    >
                      Delete
                    </button>
                    <span className="text-gray-500 text-xs">
                        {postItem.sentiment_score === null ? "Vibe unavailable" : `vibe: ${postItem.sentiment_score}/100`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <DeleteDialog
        activeDeletePost={activeDeletePost}
        setActiveDeletePost={setActiveDeletePost}
        handleDelete={handleDelete}
        deleting={deleting}
        error={error}
      />
    </>
  );
}
