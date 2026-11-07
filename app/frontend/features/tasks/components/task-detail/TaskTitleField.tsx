import type { Task } from "@/types"

// A borderless title that grows with its text and saves on blur.
export function TaskTitleField({
  task,
  onSave,
}: {
  task: Task
  onSave: (title: string) => void
}) {
  return (
    <textarea
      aria-label="Title"
      defaultValue={task.title}
      placeholder="Task title"
      rows={1}
      maxLength={255}
      className="field-sizing-content -mx-2 resize-none rounded-md bg-transparent px-2 font-semibold text-lg leading-snug outline-none placeholder:text-muted-foreground/72 focus-visible:bg-accent/40"
      onBlur={(event) => {
        const title = event.target.value.trim()
        if (title === "") event.target.value = task.title
        else if (title !== task.title) onSave(title)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
    />
  )
}
