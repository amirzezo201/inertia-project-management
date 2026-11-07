import { Link, router, usePage } from "@inertiajs/react"
import { Ellipsis, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { CommentInput } from "@/components/activity/comment-input"
import { EditedMark, TimeAgo } from "@/components/activity/time-ago"
import { UserAvatar } from "@/components/activity/user-avatar"
import { Button } from "@/components/ui/button"
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu"
import { formatDate, priorityLabels } from "@/lib/tasks"
import { cn } from "@/lib/utils"
import { commentPath, taskPath } from "@/routes"
import type { ActivityEvent, Comment, TaskPriority, UserSummary } from "@/types"

interface ActivityEntryProps {
  event: ActivityEvent
  users: UserSummary[]
  // Follows an entry by the same person moments earlier: hide the header.
  grouped: boolean
}

export function ActivityEntry({ event, users, grouped }: ActivityEntryProps) {
  const author = users.find((user) => user.id === event.creator_id)

  if (event.comment) {
    return (
      <CommentEntry
        comment={event.comment}
        author={author}
        users={users}
        grouped={grouped}
      />
    )
  }

  return (
    <li
      className={cn(
        "flex items-start gap-3 text-sm",
        grouped ? "py-0.5" : "pt-3 pb-0.5",
      )}
    >
      <div className="flex w-7 shrink-0 justify-center">
        {grouped ? null : <UserAvatar name={author?.name} className="size-5" />}
      </div>
      <p className="min-w-0 flex-1 text-muted-foreground">
        {!grouped && (
          <span className="font-medium text-foreground">
            {author?.name ?? "Someone"}{" "}
          </span>
        )}
        <EventDescription event={event} />
        <TimeAgo
          date={event.created_at}
          className="ms-2 text-muted-foreground/72"
        />
      </p>
    </li>
  )
}

const attributeLabels: Record<string, string> = {
  title: "title",
  description: "description",
  status: "status",
  priority: "priority",
  assignee: "assignee",
  milestone: "milestone",
  start_date: "start date",
  due_date: "due date",
  estimation: "estimation",
}

function formatValue(attribute: string, value: string | number | null) {
  if (value === null || value === "") return null
  if (attribute === "priority")
    return priorityLabels[value as TaskPriority] ?? String(value)
  if (attribute === "start_date" || attribute === "due_date")
    return formatDate(String(value))
  if (attribute === "estimation")
    return Number(value) ? `${Number(value)}h` : null
  return String(value)
}

function Value({ children }: { children: string }) {
  return <span className="font-medium text-foreground">{children}</span>
}

// Huly-style sentences: "changed status from Todo to In progress".
function EventDescription({ event }: { event: ActivityEvent }) {
  const { particulars } = event

  switch (event.action) {
    case "task_created":
      return <>created the task</>
    case "task_subtask_added":
      return (
        <>
          added sub-task{" "}
          <Link
            href={taskPath(Number(particulars.subtask_id))}
            className="font-medium text-foreground hover:underline"
          >
            {particulars.identifier} {particulars.title}
          </Link>
        </>
      )
    case "task_updated": {
      const attribute = String(particulars.attribute)
      const label = attributeLabels[attribute] ?? attribute.replace(/_/g, " ")
      const from = formatValue(attribute, particulars.from)
      const to = formatValue(attribute, particulars.to)

      if (attribute === "description") return <>updated the description</>
      if (attribute === "assignee") {
        return to ? (
          <>
            assigned to <Value>{to}</Value>
          </>
        ) : (
          <>
            removed assignee <Value>{from ?? ""}</Value>
          </>
        )
      }
      if (!to) return <>removed the {label}</>
      if (!from) {
        return (
          <>
            set {label} to <Value>{to}</Value>
          </>
        )
      }
      return (
        <>
          changed {label} from <Value>{from}</Value> to <Value>{to}</Value>
        </>
      )
    }
    default:
      return <>updated the task</>
  }
}

function CommentEntry({
  comment,
  author,
  users,
  grouped,
}: {
  comment: Comment
  author?: UserSummary
  users: UserSummary[]
  grouped: boolean
}) {
  const { auth } = usePage().props
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const isOwn = comment.creator_id === auth.user.id

  function saveEdit(body: string) {
    router.patch(
      commentPath(comment.id),
      { body },
      {
        preserveScroll: true,
        preserveState: true,
        onStart: () => setSaving(true),
        onFinish: () => setSaving(false),
        onSuccess: () => setEditing(false),
      },
    )
  }

  return (
    <li className={cn("group/comment flex gap-3", grouped ? "pt-1" : "pt-4")}>
      <div className="flex w-7 shrink-0 justify-center">
        {!grouped && <UserAvatar name={author?.name} />}
      </div>
      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-medium">{author?.name ?? "Someone"}</span>
            <TimeAgo date={comment.created_at} />
            {comment.edited_at && <EditedMark date={comment.edited_at} />}
          </div>
        )}

        {editing ? (
          <div className="mt-1">
            <CommentInput
              users={users}
              initialBody={comment.body}
              autoFocus
              sending={saving}
              onSubmit={saveEdit}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="relative">
            <div
              className="rich-text text-sm"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: comment bodies are sanitized server-side (RichDescription.sanitize)
              dangerouslySetInnerHTML={{ __html: comment.body }}
            />
            {grouped && comment.edited_at && (
              <EditedMark date={comment.edited_at} />
            )}
            {isOwn && (
              <div className="absolute end-0 -top-7 opacity-0 transition-opacity focus-within:opacity-100 group-hover/comment:opacity-100">
                <Menu>
                  <MenuTrigger
                    render={<Button variant="ghost" size="icon-xs" />}
                    aria-label="Comment actions"
                  >
                    <Ellipsis />
                  </MenuTrigger>
                  <MenuPopup align="end">
                    <MenuItem
                      onClick={() => {
                        setEditing(true)
                      }}
                    >
                      <Pencil />
                      Edit
                    </MenuItem>
                    <MenuItem
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Delete this comment?")) {
                          router.delete(commentPath(comment.id), {
                            preserveScroll: true,
                          })
                        }
                      }}
                    >
                      <Trash2 />
                      Delete
                    </MenuItem>
                  </MenuPopup>
                </Menu>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
