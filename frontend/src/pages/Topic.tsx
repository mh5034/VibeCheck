import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { createPost, getTopicPosts, type TopicDetail } from "../api/client";
import PostCard from "../components/PostCard";

function VibeBar({ score }: { score: number | null }) {
  if (score === null) return null;
  const color =
    score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
      <div
        className={`${color} h-2 rounded-full transition-all`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
  );
}

export default function Topic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [topic, setTopic] = useState<TopicDetail | null>();
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const charLimit = 280;

  useEffect(() => {
    if (!id) return;
    loadTopic();
  }, [id]);

  async function loadTopic() {
    try {
      const data = await getTopicPosts(Number(id));
      setTopic(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout(); // logout if token expired
        navigate("/auth"); // redirect to auth page
      }
      setError("Failed to load topic");
    } finally {
      setLoading(false);
    }
  }

  async function handlePost() {
    if (!newPost.trim() || !id) return;
    setPosting(true);

    try {
      const post = await createPost(Number(id), newPost.trim());
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              posts: [post, ...prev.posts],
            }
          : prev,
      );
      setNewPost("");
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  const handleDeletePost = (postId: number) => {
    setTopic((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts.filter((p) => p.id !== postId),
      };
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  if (!topic)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Topic not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Topic Header */}
        <div className="w-full rounded-xl bg-slate-900 border border-slate-800 p-6 mb-6">
          <h1 className="text-white text-2xl font-bold mb-1">#{topic.name}</h1>
          {/* Vibe Score */}
          {topic.vibe_score !== null && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Community Vibe</span>
                <span className="text-white font-bold">
                  {topic.vibe_score}/100
                </span>
              </div>
              <VibeBar score={topic.vibe_score} />
            </div>
          )}
          {/* AI Summary */}
          {topic.summary && (
            <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <p className="text-purple-300 text-xs font-semibold mb-1">
                🤖 AI Summary
              </p>
              <p className="text-gray-300 text-sm">{topic.summary}</p>
            </div>
          )}
        </div>

        {/* Post Input */}
        {isLoggedIn ? (
          <div className="flex flex-col gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 transition-all focus-within:ring-2 focus-within:ring-purple-500">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value.slice(0, charLimit))}
              placeholder="What's your vibe on this?"
              rows={3}
              className="w-full bg-transparent text-slate-100 outline-none resize-none placeholder-slate-500 text-sm leading-relaxed"
            />

            <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-800/40">
              <span className="text-slate-500 text-xs font-medium">
                {newPost.length}/{charLimit}
              </span>
              <button
                onClick={handlePost}
                disabled={posting || !newPost.trim()}
                className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-40 disabled:pointer-events-none text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md shadow-purple-950/10"
              >
                {posting ? "Posting..." : "Post Vibe"}
              </button>
            </div>
          </div>
        ) : (
          <Link
            to="/auth"
            className="flex items-center justify-center w-full py-4 rounded-xl bg-slate-900 border border-slate-800 transition-colors duration-200 hover:bg-slate-800/80 group mb-6"
          >
            <span className="text-slate-400">
              <span className="text-purple-500 font-semibold group-hover:underline">
                Login
              </span>{" "}
              to post your vibe
            </span>
          </Link>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Posts */}
        <div className="flex flex-col gap-3">
          {topic.posts.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              No vibes yet — be the first! 👆
            </div>
          ) : (
            topic.posts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
