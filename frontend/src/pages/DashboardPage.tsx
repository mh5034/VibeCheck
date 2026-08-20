import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  deletePost,
  getDashboard,
  type Dashboard,
  type Post,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";

function getSentimentEmoji(score: number | null) {
  if (score === null) return "💬";
  if (score >= 70) return "😊";
  if (score >= 40) return "😐";
  return "😞";
}

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  if (!dashboard) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-950 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h1 className="text-white text-2xl font-bold mb-4">My Dashboard</h1>

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-white">
                  {dashboard.total_posts}
                </p>
                <p className="text-gray-400 text-sm mt-1">Total Vibes</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
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
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3"
                >
                  <span className="text-2xl">
                    {getSentimentEmoji(postItem.sentiment_score)}
                  </span>
                  <div className="flex-1">
                    <p className="text-purple-400 text-xs font-semibold mb-1">
                      #{postItem.topic_name}
                    </p>
                    <div className="flex justify-between">
                      <p className="text-white text-sm">{postItem.content}</p>
                      <button
                        onClick={() => setActiveDeletePost(postItem)}
                        className="text-gray-500 hover:text-red-400 text-xs transition-colors duration-200 ml-2"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500 text-xs">
                        {new Date(postItem.created_at).toLocaleDateString()}
                      </span>
                      {postItem.sentiment_score !== null && (
                        <span className="text-gray-400 text-xs">
                          vibe: {postItem.sentiment_score}/100
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

      {/* Confirm Delete Dialog */}
      <Dialog
        open={activeDeletePost !== null}
        onOpenChange={(open) => !open && setActiveDeletePost(null)}
      >
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this vibe?</DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* Dynamic Post Content Preview */}
          {activeDeletePost && (
            <div className="bg-gray-700 rounded-lg p-3 my-2 border border-gray-600">
              <p className="text-gray-300 text-sm">
                {activeDeletePost.content}
              </p>
            </div>
          )}

          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

          <DialogFooter className="gap-2 bg-gray-800 border-gray-700">
            <Button
              variant="outline"
              onClick={() => setActiveDeletePost(null)}
              disabled={deleting}
              className="text-slate-900 dark:text-slate-100 border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
