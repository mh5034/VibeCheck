import { Link } from "react-router-dom";
import { type Topic } from "../api/client";

function getVibeColor(score: number | null) {
  if (score === null) return "text-gray-400";
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

function getVibeEmoji(score: number | null) {
  if (score === null) return "🤔";
  if (score >= 70) return "😍";
  if (score >= 40) return "😐";
  return "😤";
}

export default function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Link to={`/topic/${topic.id}`}>
      <div className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 transition-colors duration-200 hover:bg-slate-800/80">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-semibold text-lg ml-1">
            #{topic.name}
          </h2>
          <span className="text-2xl mr-1">
            {getVibeEmoji(topic.vibe_score)}
          </span>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-gray-400 text-sm ml-1">
            {topic.post_count} vibes
          </span>
          <span
            className={`font-bold text-sm mr-1 ${getVibeColor(topic.vibe_score)}`}
          >
            {topic.vibe_score !== null
              ? `Vibe score: ${topic.vibe_score}/100`
              : `No vibes yet`}
          </span>
        </div>
      </div>
    </Link>
  );
}
