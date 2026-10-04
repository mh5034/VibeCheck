/** Keep the neutral band aligned with the backend sentiment rubric. */
export function getSentimentEmoji(score: number | null): string {
  if (score === null || !Number.isFinite(score)) return "💬";
  if (score >= 80) return "😍";
  if (score > 55) return "😊";
  if (score >= 45) return "😐";
  if (score >= 20) return "😞";
  return "😢";
}

export function getSentimentTone(score: number | null): "unavailable" | "positive" | "neutral" | "negative" {
  if (score === null || !Number.isFinite(score)) return "unavailable";
  if (score > 55) return "positive";
  if (score >= 45) return "neutral";
  return "negative";
}
