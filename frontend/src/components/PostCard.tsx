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

function getSentimentEmoji(score: number | null) {
  if (score === null) return "💬";
  if (score >= 70) return "😊";
  if (score >= 40) return "😐";
  return "😞";
}

type PostCardProps = {
  post: Post;
  onDelete: (postId: number) => void;
};

export default function PostCard({ post, onDelete }: PostCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      await deletePost(post.id);
      setShowDialog(false);
      onDelete(post.id);
    } catch (error) {
      setError("Could not delete post. Make sure you are the author.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <>
      <div className="flex gap-3 w-full p-4 rounded-xl bg-slate-900 border border-slate-800">
        <span className="text-2xl">
          {getSentimentEmoji(post.sentiment_score)}
        </span>
        <div className="flex-1">
          <div className="flex justify-between">
            <p className="text-white">{post.content}</p>
            <button
              onClick={() => setShowDialog(true)}
              className="text-gray-500 hover:text-red-400 text-xs transition-colors duration-200 ml-2"
            >
              Delete
            </button>
          </div>
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

      {/* Confirm Delete Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border border-slate-800">
          {/* w-full p-5 rounded-xl bg-slate-900 border border-slate-800 transition-colors duration-200 hover:bg-slate-800/80 */}
          <DialogHeader>
            <DialogTitle className="text-white">Delete this vibe?</DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* Show post preview inside dialog */}
          <div className="bg-gray-700 rounded-lg p-3 my-2">
            <p className="text-gray-300 text-sm">{post.content}</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <DialogFooter className="bg-slate-950 border border-slate-900">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={deleting}
              className="text-slate-900 dark:text-slate-100 border-gray-600 px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-300 active:bg-gray-500"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-red-500 active:bg-red-700"
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
