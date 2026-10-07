import { type Dashboard } from "@/api/client";
import { getSentimentTone } from "@/lib/sentiment";
import {
  Pie,
  PieChart,
  Tooltip,
  Cell,
  type TooltipContentProps,
} from "recharts";

type DashboardPieChartProps = {
  dashboard: Dashboard;
};

const sentimentStyles = {
  Positive: { color: "#34d399", text: "text-emerald-300", emoji: "😊" },
  Neutral: { color: "#fbbf24", text: "text-amber-200", emoji: "😐" },
  Negative: { color: "#fb7185", text: "text-rose-300", emoji: "😞" },
};

function SentimentTooltip({ active, payload }: TooltipContentProps) {
  const entry = payload?.[0];
  if (!active || !entry || typeof entry.value !== "number") return null;

  const name = entry.name;
  if (name !== "Positive" && name !== "Neutral" && name !== "Negative")
    return null;
  const style = sentimentStyles[name];

  return (
    <div className="rounded-xl border border-purple-800/60 bg-slate-950 px-4 py-3 shadow-xl shadow-black/40">
      <p className="mb-2 text-xs text-slate-400">Sentiment tone</p>
      <p
        className={`flex items-center gap-2 text-sm font-semibold ${style.text}`}
      >
        <span aria-hidden="true">{style.emoji}</span>
        {name}
      </p>
      <p className="mt-2 text-sm text-white">
        <span className="font-semibold">{entry.value}</span>{" "}
        {entry.value === 1 ? "vibe" : "vibes"}
      </p>
    </div>
  );
}

export default function DashboardPieChart({
  dashboard,
}: DashboardPieChartProps) {
  const sentimentData = [
    {
      name: "Positive",
      value: dashboard.posts.filter(
        (post) => getSentimentTone(post.sentiment_score) === "positive",
      ).length,
    },
    {
      name: "Neutral",
      value: dashboard.posts.filter(
        (post) => getSentimentTone(post.sentiment_score) === "neutral",
      ).length,
    },
    {
      name: "Negative",
      value: dashboard.posts.filter(
        (post) => getSentimentTone(post.sentiment_score) === "negative",
      ).length,
    },
  ];

  const COLORS = Object.values(sentimentStyles).map((style) => style.color);
  return (
    <div className="mt-5">
      <h3 className="font-semibold text-white">Sentiment Breakdown</h3>
      <p className="mb-1 text-xs text-slate-400">Your vibes by tone</p>
      <PieChart
        style={{
          width: 200,
          height: 220,
        }}
        responsive
      >
        <Pie
          data={sentimentData}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={65}
          paddingAngle={3}
          stroke="none"
        >
          {sentimentData.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip content={SentimentTooltip} />
      </PieChart>
      <div className="flex gap-3 text-sm mt-1">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-gray-300">Positive</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-gray-300">Neutral</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="text-gray-300">Negative</span>
        </div>
      </div>
    </div>
  );
}
