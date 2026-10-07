import { type Dashboard } from "@/api/client";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
} from "recharts";

type DashboardLineChartProps = {
  dashboard: Dashboard;
};

export default function DashboardLineChart({
  dashboard,
}: DashboardLineChartProps) {
  const recentPosts = dashboard.posts.slice(0, 5).reverse();
  const recentPostsData = recentPosts.map((post) => ({
    createdAt: post.created_at,
    date: new Date(post.created_at).toLocaleDateString(),
    sentiment: post.sentiment_score,
  }));
  return (
    <div className="mt-5">
      <h3 className="font-semibold text-white">Sentiment Trend</h3>
      <p className="mb-1 text-xs text-slate-400">Your latest vibes</p>
      <LineChart
        style={{
          width: 400,
          height: 250,
        }}
        responsive
        data={recentPostsData}
        margin={{
          top: 15,
          right: 70,
          left: -30,
          bottom: 15,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#334155"
          vertical={false}
        />

        <XAxis
          dataKey="createdAt"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          tickFormatter={(_, index) => {
            const currentDate = recentPostsData[index]?.date;

            if (index > 0 && recentPostsData[index - 1]?.date === currentDate) {
              return "";
            }

            return currentDate;
          }}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#020617",
            border: "1px solid #6b21a8",
            borderRadius: "12px",
          }}
          labelStyle={{ color: "#94a3b8" }}
          labelFormatter={(value) => {
            if (typeof value !== "string" && typeof value !== "number") {
              return "";
            }

            return new Date(value).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });
          }}
          formatter={(value) => [`${value}/100`, "Sentiment"]}
        />

        <Line
          type="monotone"
          dataKey="sentiment"
          name="Sentiment"
          stroke="#a855f7"
          strokeWidth={3}
          dot={{
            r: 4,
            fill: "#020617",
            stroke: "#a855f7",
            strokeWidth: 2,
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </div>
  );
}
