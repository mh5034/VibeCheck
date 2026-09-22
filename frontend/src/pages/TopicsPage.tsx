import { Topic } from "@/api/client";
import { useEffect, useState } from "react";
import { getTopics } from "@/api/client";
import TopicCard from "@/components/TopicCard";
import { useNavigate } from "react-router-dom";

export default function Topics() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(normalizedQuery),
  );

  useEffect(() => {
    loadTopics();
  }, [topics]);

  async function loadTopics() {
    try {
      const data = await getTopics();
      setTopics(data); // Show all topics
    } catch {
      setError("Failed to load topics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back
        </button>
        <div className="flex justify-between">
          <span className="text-2xl font-bold text-white mb-6">
            Explore topics
          </span>
          <span>
            <input
              id="topic-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchQuery("");
              }}
              placeholder="🔍 Search topics..."
              aria-controls="topic-results"
              className="text-sm min-w-0 flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-1 outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-sm text-gray-300 ml-2 hover:text-white bg-slate-800 rounded-xl px-4 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                aria-label="Clear topic search"
              >
                Clear
              </button>
            )}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : filteredTopics.length === 0 && searchQuery ? (
          <div className="text-center text-gray-400 py-20">
            No topics match your search — try a different keyword!
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No topics found. Be the first to create one!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTopics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
