import { getSentimentEmoji, getSentimentTone } from "@/lib/sentiment";
import { Link } from "react-router-dom";
import { type Topic } from "../api/client";

const vibeColors = {
  unavailable: "text-gray-400",
  positive: "text-green-400",
  neutral: "text-yellow-400",
  negative: "text-red-400",
};

export default function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Link to={`/topic/${topic.id}`}>
      <div className="w-full p-3 rounded-xl bg-slate-950 border border-purple-800/60 transition-colors duration-200 hover:border-purple-700">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-semibold text-lg ml-1">
            #{topic.name}
          </h2>
          <span className="text-2xl mr-1">
            {getSentimentEmoji(topic.vibe_score)}
          </span>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-gray-400 text-sm ml-1">
            {topic.post_count} vibes
          </span>
          <span
            className={`font-bold text-sm mr-1 ${vibeColors[getSentimentTone(topic.vibe_score)]}`}
          >
            {topic.vibe_score !== null
              ? `Vibe score: ${topic.vibe_score}/100`
              : topic.post_count === 0 ? "No vibes yet" : "Vibe unavailable"}
          </span>
        </div>
      </div>
    </Link>
  );
}
