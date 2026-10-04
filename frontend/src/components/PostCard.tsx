import { Link } from "react-router-dom";
import { Menu } from "@base-ui/react/menu";
import { useAuth } from "@/context/AuthContext";
import { isAxiosError } from "axios";
import { Trash2, MoreHorizontal, Pencil } from "lucide-react";
import { getSentimentEmoji, getSentimentTone } from "@/lib/sentiment";
import { type Post, deletePost, updatePost } from "../api/client";
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
  onUpdated?: (post: Post) => void;
};

export default function PostCard({
  post,
  topic,
  onDeleted,
  onUpdated,
}: PostCardProps) {
  const { userId } = useAuth();
  const isAuthor = userId !== null && userId === post.user_id;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const handleSave = async () => {
    if (!isAuthor || saving || !draft.trim() || draft.trim().length > 280)
      return;
    setSaving(true);
    setEditError("");
    try {
      const updated = await updatePost(post.id, draft.trim());
      onUpdated?.(updated);
      setEditing(false);
    } catch (error) {
      setEditError(
        isAxiosError(error) && error.response?.status === 403
          ? "You can only edit your own posts."
          : "Could not save your changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  const [showDialog, setShowDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!isAuthor || deleting) return;
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
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${
                {
                  positive: "text-emerald-300",
                  neutral: "text-amber-200",
                  negative: "text-rose-300",
                  unavailable: "text-slate-400",
                }[getSentimentTone(post.sentiment_score)]
              }`}
            >
              <span className="text-lg leading-6" aria-hidden="true">
                {getSentimentEmoji(post.sentiment_score)}
              </span>
              {post.sentiment_score === null
                ? "Vibe unavailable"
                : `Vibe ${post.sentiment_score}/100`}
            </span>
            {topic && (
              <Link
                to={`/topic/${topic.id}`}
                className="min-w-0 max-w-full rounded text-xs font-medium text-purple-300 wrap-anywhere underline-offset-4 hover:text-purple-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                #{topic.name}
              </Link>
            )}
            <time
              dateTime={post.created_at}
              className="text-xs text-slate-400 sm:ml-auto"
            >
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
          {isAuthor && (
            <Menu.Root>
              <Menu.Trigger
                aria-label="Post actions"
                className="-my-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <MoreHorizontal size={18} aria-hidden="true" />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner align="end" sideOffset={6} className="z-40">
                  <Menu.Popup className="min-w-32 rounded-xl border border-purple-800/60 bg-slate-950 p-1 shadow-lg outline-none">
                    <Menu.Item
                      onClick={() => {
                        setDraft(post.content);
                        setEditError("");
                        setEditing(true);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none data-highlighted:bg-slate-800"
                    >
                      <Pencil size={14} aria-hidden="true" /> Edit
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        setError("");
                        setShowDialog(true);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 outline-none data-highlighted:bg-red-400/10"
                    >
                      <Trash2 size={14} aria-hidden="true" /> Delete
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          )}
        </header>
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-5 text-slate-100 wrap-anywhere">
          {post.content}
        </p>
      </article>

      <Dialog
        open={editing && isAuthor}
        onOpenChange={(open) => {
          if (!saving) setEditing(open);
        }}
      >
        <DialogContent
          showCloseButton={!saving}
          className="bg-slate-950 border border-purple-800 text-white"
        >
          <DialogHeader>
            <DialogTitle>Edit your vibe</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update your post. Its vibe score will be recalculated.
            </DialogDescription>
          </DialogHeader>
          <textarea
            aria-label="Post content"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={280}
            rows={4}
            disabled={saving}
            className="w-full resize-y rounded-lg border border-purple-800 bg-slate-900 p-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p className="text-xs text-slate-400">{draft.length}/280</p>
          {editError && (
            <p role="alert" className="text-sm text-red-400">
              {editError}
            </p>
          )}
          <DialogFooter className="bg-slate-950 border-purple-800">
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setEditing(false)}
              className="bg-slate-950 text-slate-200 border-gray-600 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !draft.trim() ||
                draft.trim().length > 280 ||
                draft.trim() === post.content
              }
              className="bg-purple-700 text-white hover:bg-purple-600"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={showDialog && isAuthor}
        onOpenChange={(open) => {
          if (!deleting) setShowDialog(open);
        }}
      >
        <DialogContent className="bg-slate-950 border border-purple-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete this vibe?</DialogTitle>
            <DialogDescription className="text-slate-400">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* Show post preview inside dialog */}
          <div className="bg-gray-900 rounded-lg p-3 my-2 border border-gray-600">
            <p className="text-gray-300 text-sm">{post.content}</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <DialogFooter className="bg-slate-950 border-purple-800">
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
