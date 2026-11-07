import { router } from "@inertiajs/react"
import { Download, FileText, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { taskAttachmentPath } from "@/routes"
import type { TaskAttachment } from "@/types"
import { formatFileSize } from "@/utils/fileSize"

// One attached file: a preview (or a file icon) over its name and size. The
// preview opens the file; on hover it dims under a bar of actions, kept on one
// opaque bar because the preview is a screenshot as often as not.
export function TaskAttachmentCard({
  taskId,
  attachment,
}: {
  taskId: number
  attachment: TaskAttachment
}) {
  function remove() {
    if (
      !confirm(
        `Delete ${attachment.filename}? It is also removed from the description wherever it is embedded.`,
      )
    )
      return
    router.delete(taskAttachmentPath(taskId, attachment.id), {
      preserveScroll: true,
      preserveState: true,
    })
  }

  return (
    <li className="group/attachment relative flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-ring/40">
      <div className="relative flex aspect-video items-center justify-center bg-muted">
        {attachment.thumbnail_url ? (
          <img
            src={attachment.thumbnail_url}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <FileText className="size-7 text-muted-foreground" />
        )}

        <a
          href={attachment.url}
          target="_blank"
          rel="noopener"
          className="absolute inset-0 cursor-zoom-in"
        >
          <span className="sr-only">Open {attachment.filename}</span>
        </a>

        <div className="pointer-events-none absolute inset-0 bg-black/30 p-1.5 opacity-0 transition-opacity group-focus-within/attachment:opacity-100 group-hover/attachment:opacity-100 max-sm:opacity-100">
          <div className="pointer-events-auto mx-auto flex w-fit items-center gap-0.5 rounded-md border bg-popover p-0.5 shadow-black/30 shadow-lg">
            <Button
              variant="ghost"
              size="icon-sm"
              title="Download"
              aria-label={`Download ${attachment.filename}`}
              render={
                <a
                  href={attachment.download_url}
                  download={attachment.filename}
                />
              }
            >
              <Download />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive-foreground"
              title="Delete"
              aria-label={`Delete ${attachment.filename}`}
              onClick={remove}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </div>

      <div className="min-w-0 px-2 py-1.5">
        <p className="truncate text-xs" title={attachment.filename}>
          {attachment.filename}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatFileSize(attachment.byte_size)}
        </p>
      </div>
    </li>
  )
}
