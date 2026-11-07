import { Download, Plus } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useFileDragZone } from "@/hooks/useFileDragZone"
import { cn } from "@/lib/utils"
import type { TaskAttachment } from "@/types"
import { formatFileSize } from "@/utils/fileSize"

import { TaskAttachmentCard } from "./TaskAttachmentCard"
import { TaskSectionHeading } from "./TaskSectionHeading"

// The task's files: a collapsible section with an Add button and a grid of
// cards. With none, the heading row and Add are all there is. The whole section
// takes files dropped from the computer, under an overlay that says so.
export function TaskAttachmentsSection({
  taskId,
  attachments,
  maxBytes,
  onUpload,
  uploading,
  error,
}: {
  taskId: number
  attachments: TaskAttachment[]
  maxBytes: number
  onUpload: (files: FileList) => void
  uploading: boolean
  error: string | null
}) {
  const [open, setOpen] = useState(true)
  const fileInput = useRef<HTMLInputElement>(null)
  const { dragging, dragHandlers } = useFileDragZone(onUpload)

  return (
    // Collapsed, the heading row is all there is, so the section pulls itself
    // up against the one below it.
    <section
      {...dragHandlers}
      className={cn("relative mt-6 border-t pt-5", !open && "-mb-2")}
    >
      {/* Fixed height: the Add button only renders while the section is open. */}
      <div
        className={cn(
          "flex h-7 items-center justify-between gap-3",
          open && (attachments.length > 0 || dragging) && "mb-3",
        )}
      >
        <TaskSectionHeading
          label="Attachments"
          tally={
            attachments.length > 0 ? String(attachments.length) : undefined
          }
          open={open}
          onToggle={() => setOpen(!open)}
        />
        {open && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5"
            disabled={uploading}
            title={`Up to ${formatFileSize(maxBytes)} per file`}
            onClick={() => fileInput.current?.click()}
          >
            <Plus className="size-4" />
            {uploading ? "Uploading…" : "Add"}
          </Button>
        )}
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) onUpload(event.target.files)
            event.target.value = ""
          }}
        />
      </div>

      {error && (
        <p className="mb-2 text-destructive-foreground text-xs">{error}</p>
      )}

      {open && attachments.length === 0 && dragging && (
        // Room for the drop overlay when there are no cards to cover.
        <div className="h-24" />
      )}

      {open && attachments.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
          {attachments.map((attachment) => (
            <TaskAttachmentCard
              key={attachment.id}
              taskId={taskId}
              attachment={attachment}
            />
          ))}
        </ul>
      )}

      {dragging && (
        <div className="pointer-events-none absolute inset-0 top-5 z-30 flex flex-col items-center justify-center gap-2 rounded-md border-2 border-primary border-dashed bg-background/80 text-primary backdrop-blur-sm">
          <Download className="size-6" />
          <span className="font-medium text-sm">Drop files to upload</span>
        </div>
      )}
    </section>
  )
}
