import { useEffect, useState } from "react";
import { type Topic, createTopic, getTopics } from "../api/client.ts";
import { useAuth } from "../context/AuthContext.tsx";
import TopicCard from "../components/TopicCard";

export default function () {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      const data = await getTopics();
      setTopics(data);
    } catch {
      setError("Failed to load topics");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTopic() {
    if (!newTopic.trim()) return;
    try {
      const topic = await createTopic(newTopic.trim());
      setTopics([topic, ...topics]);
      setNewTopic("");
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to create topic");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Whats the vibe? ✨
          </h1>
          <p className="text-gray-400">
            See what the community thinks about anything
          </p>
        </div>

        {/* Create Topic */}
        {isLoggedIn && (
          <div className="flex gap2 mb-8">
            <input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTopic()}
              placeholder="Start a new topic..."
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleCreateTopic}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Add
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Topics List */}
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
  );
}
