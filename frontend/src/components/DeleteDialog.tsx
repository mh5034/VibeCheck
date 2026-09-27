import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

export default function DeleteDialog({
  activeDeletePost,
  setActiveDeletePost,
  handleDelete,
  deleting,
  error,
}: {
  activeDeletePost: any;
  setActiveDeletePost: any;
  handleDelete: any;
  deleting: any;
  error: any;
}) {
  return (
    <>
      <Dialog
        open={activeDeletePost !== null}
        onOpenChange={(open) => !open && setActiveDeletePost(null)}
      >
        <DialogContent className="bg-slate-950 border border-purple-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this vibe?</DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* Dynamic Post Content Preview */}
          {activeDeletePost && (
            <div className="bg-gray-900 rounded-lg p-3 my-2 border border-gray-600">
              <p className="text-gray-300 text-sm">
                {activeDeletePost.content}
              </p>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <DialogFooter className="bg-slate-950 border border-purple-800">
            <Button
              variant="outline"
              onClick={() => setActiveDeletePost(null)}
              disabled={deleting}
              className="text-slate-900 dark:text-slate-100 border-gray-600 hover:bg-gray-300 active:bg-gray-500 rounded-lg transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-500 active:bg-red-700"
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
