import type { Post } from "../api/client";

function getSentimentEmoji(score: number | null) {
  if (score === null) return "💬";
  if (score >= 70) return "😊";
  if (score >= 40) return "😐";
  return "😞";
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 flex gap-3">
      <span className="text-2xl">
        {getSentimentEmoji(post.sentiment_score)}
      </span>
      <div className="flex-1">
        <p className="text-white">{post.content}</p>
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
  );
}
