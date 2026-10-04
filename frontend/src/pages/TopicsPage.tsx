import { useState } from "react";
import { topicsResource } from "@/api/client";
import { useResource } from "../hooks/useResource";
import TopicCard from "@/components/TopicCard";
import { useNavigate } from "react-router-dom";
import TopicCardSkeleton from "@/components/TopicCardSkeleton";

export default function Topics() {
  const navigate = useNavigate();
  const {
    data: topics = [],
    error,
    loading,
    retry,
  } = useResource(topicsResource);
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(normalizedQuery),
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-950 to-black px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back
        </button>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="shrink-0 text-2xl font-bold text-white">
            Explore Vibes
          </h1>
          <div className="flex min-w-0 gap-2 sm:max-w-xs">
            <input
              id="topic-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchQuery("");
              }}
              placeholder="🔍 Search topics..."
              aria-label="Search topics"
              className="text-sm w-full min-w-0 flex-1 bg-slate-950 border border-purple-800 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="shrink-0 text-sm text-gray-300 hover:text-white bg-slate-950 border border-purple-800 rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                aria-label="Clear topic search"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {!!error && (
          <div
            role="alert"
            className="bg-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm"
          >
            Failed to load topics.{" "}
            <button onClick={retry} className="underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, index) => (
              <TopicCardSkeleton key={index} />
            ))}
          </div>
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
