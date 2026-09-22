import { useEffect, useState } from "react";
import { type Topic, createTopic, getTopics } from "../api/client.ts";
import { useAuth } from "../context/AuthContext.tsx";
import TopicCard from "../components/TopicCard";
import { Link, useNavigate } from "react-router-dom";

export default function () {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTopics();
  }, [topics]);

  async function loadTopics() {
    try {
      const data = await getTopics();
      setTopics(data.slice(0, 5)); // Show only the first 5 topics
    } catch {
      setError("Failed to load topics");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTopic() {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    if (!newTopic.trim()) return;
    try {
      const topic = await createTopic(newTopic.trim());
      setTopics([...topics, topic]);
      setNewTopic("");
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to create topic");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center mt-12">
          <h1 className="text-5xl font-bold text-white mb-1 tracking-tight">
            What's the vibe?
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            See what the community thinks. Share your thoughts and track the
            internet's pulse in real-time.
          </p>
        </div>

        {/* Create Topic */}
        {isLoggedIn ? (
          <div className="flex gap-2 mb-8">
            <input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTopic()}
              placeholder="Start a new topic..."
              className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleCreateTopic}
              className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Post topic
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="flex items-center justify-center w-full py-4 rounded-xl bg-slate-900 border border-slate-800 transition-colors duration-200 hover:bg-slate-800/80 group mb-8"
          >
            <span className="text-slate-400">
              <span className="text-purple-500 font-semibold group-hover:underline">
                Login
              </span>{" "}
              to create a topic
            </span>
          </Link>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Topics List */}
        <div id="topic-results" aria-busy={loading}>
          <div className="flex justify-between mb-2">
            <span className="text-white font-semibold">🔥 Trending vibes</span>
            <span className="text-gray-300 hover:text-white text-sm">
              <button
                onClick={() => {
                  navigate("/topics");
                }}
              >
                View all
              </button>
            </span>
          </div>
          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading...</div>
          ) : topics.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              No topics yet — create one! 👆
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
