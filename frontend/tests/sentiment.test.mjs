import assert from "node:assert/strict";
import test from "node:test";
import { getSentimentEmoji, getSentimentTone } from "../src/lib/sentiment.ts";

test("emoji distinguishes positive, neutral, negative and unavailable scores", () => {
  for (const [score, emoji] of [[null, "💬"], [NaN, "💬"], [0, "😢"], [19, "😢"], [20, "😞"], [44.9, "😞"], [45, "😐"], [50, "😐"], [55, "😐"], [55.1, "😊"], [79, "😊"], [80, "😍"], [100, "😍"]]) {
    assert.equal(getSentimentEmoji(score), emoji);
  }
});

test("topic colors share the post emoji sentiment boundaries", () => {
  for (const [score, tone] of [[null, "unavailable"], [0, "negative"], [44.9, "negative"], [45, "neutral"], [55, "neutral"], [55.1, "positive"], [100, "positive"]]) {
    assert.equal(getSentimentTone(score), tone);
  }
});
