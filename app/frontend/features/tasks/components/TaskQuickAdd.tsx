import { router } from "@inertiajs/react"
import { Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { projectTasksPath } from "@/routes"
import type { ProjectOption } from "@/types"

// Plane's inline add at the bottom of a group: type a title and press Enter;
// the field stays open for the next one.
export function TaskQuickAdd({
  project,
  statusId,
  open,
  onOpenChange,
  compact = false,
}: {
  project: ProjectOption
  statusId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  // Board columns use a tighter, borderless version.
  compact?: boolean
}) {
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the title field when the row opens (and again after each save).
  useEffect(() => {
    if (open && !saving) inputRef.current?.focus()
  }, [open, saving])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className={cn(
          "flex w-full items-center gap-2 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent/40 hover:text-foreground",
          compact ? "rounded-lg px-2 py-1.5" : "border-b px-5 py-2.5",
        )}
      >
        <Plus className="size-3.5" />
        New task
      </button>
    )
  }

  function create() {
    if (title.trim() === "" || saving) return

    router.post(
      projectTasksPath(project.id),
      { title: title.trim(), status_id: String(statusId) },
      {
        preserveScroll: true,
        preserveState: true,
        onStart: () => setSaving(true),
        onFinish: () => setSaving(false),
        onSuccess: () => setTitle(""),
      },
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        compact
          ? "rounded-lg border bg-card px-2 py-2"
          : "min-h-12 border-b px-5 py-2",
      )}
    >
      <span className="font-medium text-muted-foreground/72 text-xs">
        {project.identifier}
      </span>
      <input
        ref={inputRef}
        aria-label="Task title"
        value={title}
        disabled={saving}
        placeholder="Task title"
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            create()
          }
          if (event.key === "Escape") onOpenChange(false)
        }}
        onBlur={() => title.trim() === "" && onOpenChange(false)}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/72"
      />
      <span
        className={cn(
          "text-muted-foreground text-xs italic",
          compact ? "hidden" : "hidden sm:block",
        )}
      >
        Press 'Enter' to add another task
      </span>
    </div>
  )
}
