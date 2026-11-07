import { DateTimeText } from "@/components/common/DateTimeText"
import type { Option, Task } from "@/types"

// Who created the task and when it last changed, under the Properties.
export function TaskTimestamps({
  task,
  users,
}: {
  task: Task
  users: Option[]
}) {
  const creator = users.find((user) => user.value === String(task.creator_id))

  return (
    <dl className="mt-6 flex flex-col gap-1 text-muted-foreground text-xs">
      <div className="flex gap-1">
        <dt>Created by</dt>
        <dd className="text-foreground">{creator?.label ?? "Unknown"}</dd>
        <dd>
          on <DateTimeText date={task.created_at} />
        </dd>
      </div>
      <div className="flex gap-1">
        <dt>Updated</dt>
        <dd>
          <DateTimeText date={task.updated_at} />
        </dd>
      </div>
    </dl>
  )
}
