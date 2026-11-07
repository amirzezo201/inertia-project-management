import { router } from "@inertiajs/react"
import { Hash, Link2, LoaderCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toastManager } from "@/components/ui/toast"
import { useClipboard } from "@/hooks/useClipboard"
import { cn } from "@/lib/utils"
import { taskPath } from "@/routes"
import type { Task } from "@/types"

import type { SaveState } from "../../TaskDetailPage"

// The task's actions row (itsaplan's IssueActionsBar): whether the last edit
// saved, then copy ID, copy link, and delete as quiet icon buttons.
export function TaskActions({
  task,
  saveState,
}: {
  task: Task
  saveState: SaveState
}) {
  const [, copy] = useClipboard()

  async function copyText(text: string, title: string) {
    if (await copy(text)) toastManager.add({ title, type: "success" })
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <span
        aria-live="polite"
        className={cn(
          "me-auto flex items-center gap-1 text-muted-foreground text-xs transition-opacity",
          saveState === "idle" && "opacity-0",
        )}
      >
        {saveState === "saving" && (
          <LoaderCircle className="size-3.5 animate-spin" />
        )}
        {saveState === "saving"
          ? "Saving..."
          : saveState === "saved"
            ? "Saved"
            : ""}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground"
        aria-label="Copy ID"
        title={`Copy ${task.identifier}`}
        onClick={() => copyText(task.identifier, `Copied ${task.identifier}`)}
      >
        <Hash />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground"
        aria-label="Copy link"
        title="Copy link"
        onClick={() => copyText(window.location.href, "Link copied!")}
      >
        <Link2 />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-destructive-foreground"
        aria-label="Delete task"
        title="Delete task"
        onClick={() => {
          const message =
            task.subtasks_count > 0
              ? `Delete ${task.identifier} and its ${task.subtasks_count} sub-tasks?`
              : `Delete ${task.identifier}?`
          if (confirm(message)) router.delete(taskPath(task.id))
        }}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
