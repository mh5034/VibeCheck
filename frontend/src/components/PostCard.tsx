import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { getSentimentEmoji, getSentimentTone } from "@/lib/sentiment";
import { type Post, deletePost } from "../api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type PostCardProps = {
  post: Post;
  topic?: { id: number; name: string };
  onDeleted?: (postId: number) => void;
};

export default function PostCard({ post, topic, onDeleted }: PostCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      await deletePost(post.id);
      setShowDialog(false);
      onDeleted?.(post.id);
    } catch {
      setError("Could not delete post. Make sure you are the author.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <>
      <article className="w-full min-w-0 rounded-xl border border-purple-800/60 bg-slate-950 px-3 py-2.5">
        <header className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
            <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${
              {
                positive: "text-emerald-300",
                neutral: "text-amber-200",
                negative: "text-rose-300",
                unavailable: "text-slate-400",
              }[getSentimentTone(post.sentiment_score)]
            }`}>
              <span className="text-lg leading-6" aria-hidden="true">
                {getSentimentEmoji(post.sentiment_score)}
              </span>
              {post.sentiment_score === null ? "Vibe unavailable" : `Vibe ${post.sentiment_score}/100`}
            </span>
            {topic && (
              <Link
                to={`/topic/${topic.id}`}
                className="min-w-0 max-w-full rounded text-xs font-medium text-purple-300 wrap-anywhere underline-offset-4 hover:text-purple-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                #{topic.name}
              </Link>
            )}
            <time dateTime={post.created_at} className="text-xs text-slate-400 sm:ml-auto">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: "short", day: "numeric", year: "numeric",
              })}
            </time>
          </div>
          <button
            type="button"
            aria-label="Delete this vibe"
            title="Delete this vibe"
            onClick={() => { setError(""); setShowDialog(true); }}
            className="-my-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-400/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </header>
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-5 text-slate-100 wrap-anywhere">
          {post.content}
        </p>
      </article>

      {/* Confirm Delete Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-950 border border-purple-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this vibe?</DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* Show post preview inside dialog */}
          <div className="bg-gray-900 rounded-lg p-3 my-2 border border-gray-600">
            <p className="text-gray-300 text-sm">{post.content}</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <DialogFooter className="bg-slate-950 border border-purple-800">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={deleting}
              className="bg-slate-950 text-slate-200 border-gray-600 rounded-lg hover:bg-slate-800 hover:text-white active:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 text-white rounded-lg hover:bg-red-500 active:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
