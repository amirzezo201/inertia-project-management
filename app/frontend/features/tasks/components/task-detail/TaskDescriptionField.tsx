import { useLayoutEffect, useRef, useState } from "react"

import {
  type EmbeddableFile,
  RichTextEditor,
} from "@/components/common/editor/RichTextEditor"
import { cn } from "@/lib/utils"
import type { Option, Task } from "@/types"

const DESCRIPTION_CLAMP = 140

// The description editor, collapsed to 140px with "Show all" when long.
export function TaskDescriptionField({
  task,
  users,
  onSave,
  uploadFiles,
}: {
  task: Task
  users: Option[]
  onSave: (description: string) => void
  // Pasting or dropping an image into the description attaches it to the
  // task and embeds it.
  uploadFiles: (files: File[]) => Promise<EmbeddableFile[]>
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useLayoutEffect(() => {
    const element = contentRef.current
    if (!element) return
    const observer = new ResizeObserver(() =>
      setOverflows(element.scrollHeight > DESCRIPTION_CLAMP + 24),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const clamped = overflows && !expanded

  return (
    <div>
      <div
        ref={contentRef}
        onFocusCapture={() => setExpanded(true)}
        className={cn("relative", clamped && "overflow-hidden")}
        style={clamped ? { maxHeight: DESCRIPTION_CLAMP } : undefined}
      >
        <RichTextEditor
          content={task.description}
          placeholder="Click to add description"
          editorClassName="min-h-16"
          slashCommands
          mentions={users}
          uploadFiles={uploadFiles}
          onEmbed={(html) => onSave(html)}
          onBlur={(html) => {
            if (html !== (task.description ?? "")) onSave(html)
          }}
        />
        {clamped && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background" />
        )}
      </div>
      {overflows && (
        <button
          type="button"
          className="mt-1 text-primary text-sm hover:underline"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  )
}
