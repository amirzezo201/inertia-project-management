import { Link, router, usePage } from "@inertiajs/react"
import {
  CalendarDays,
  CircleDot,
  Clock,
  Ellipsis,
  Flag,
  ListTree,
  MessageSquare,
  Pencil,
  Plus,
  SignalHigh,
  Trash2,
  Type,
  UserRound,
} from "lucide-react"
import { type ReactNode, useState } from "react"

import { CommentInput } from "@/components/activity/comment-input"
import { EditedMark, TimeAgo } from "@/components/activity/time-ago"
import { UserAvatar } from "@/components/activity/user-avatar"
import { Button } from "@/components/ui/button"
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu"
import { formatDate, priorityLabels } from "@/lib/tasks"
import { commentPath, taskPath } from "@/routes"
import type { ActivityEvent, Comment, TaskPriority, UserSummary } from "@/types"

interface ActivityEntryProps {
  event: ActivityEvent
  users: UserSummary[]
  // The last entry has no connecting line below its icon.
  last: boolean
}

// One step on Plane's activity timeline: an icon box on the rail, then
// either a change ("Ann set the status to Done · 2 hours ago") or a comment card.
export function ActivityEntry({ event, users, last }: ActivityEntryProps) {
  const author = users.find((user) => user.id === event.creator_id)

  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      {!last && (
        <span
          aria-hidden
          className="absolute top-8 bottom-0 left-[13px] w-px bg-border"
        />
      )}
      <span className="z-[1] flex size-7 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground shadow-xs/5 [&_svg]:size-3.5">
        {iconFor(event)}
      </span>

      {event.comment ? (
        <CommentCard comment={event.comment} author={author} users={users} />
      ) : (
        <p className="min-w-0 flex-1 pt-1 text-muted-foreground text-xs leading-5">
          <span className="font-medium text-foreground">
            {author?.name ?? "Someone"}
          </span>{" "}
          <EventDescription event={event} />{" "}
          <TimeAgo
            date={event.created_at}
            className="text-muted-foreground/72"
          />
        </p>
      )}
    </li>
  )
}

function iconFor(event: ActivityEvent): ReactNode {
  if (event.action === "comment_created") return <MessageSquare />
  if (event.action === "task_created") return <Plus />
  if (event.action === "task_subtask_added") return <ListTree />

  switch (event.particulars.attribute) {
    case "status":
      return <CircleDot />
    case "priority":
      return <SignalHigh />
    case "assignee":
      return <UserRound />
    case "milestone":
      return <Flag />
    case "start_date":
    case "due_date":
      return <CalendarDays />
    case "estimation":
      return <Clock />
    default:
      return <Type />
  }
}

const attributeLabels: Record<string, string> = {
  status: "status",
  priority: "priority",
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

function Value({ children }: { children: ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>
}

// Plane's phrasing: "set the status to Done.", "added a new assignee Ann".
function EventDescription({ event }: { event: ActivityEvent }) {
  const { particulars } = event

  switch (event.action) {
    case "task_created":
      return <>created the task.</>
    case "task_subtask_added":
      return (
        <>
          added the sub-task{" "}
          <Link
            href={taskPath(Number(particulars.subtask_id))}
            className="font-medium text-foreground hover:underline"
          >
            {particulars.identifier} {particulars.title}
          </Link>
          .
        </>
      )
    case "task_updated": {
      const attribute = String(particulars.attribute)
      const from = formatValue(attribute, particulars.from)
      const to = formatValue(attribute, particulars.to)

      switch (attribute) {
        case "title":
          return (
            <>
              set the name to <Value>{to}</Value>.
            </>
          )
        case "description":
          return <>updated the description.</>
        case "assignee":
          return to ? (
            <>
              added a new assignee <Value>{to}</Value>.
            </>
          ) : (
            <>
              removed the assignee <Value>{from}</Value>.
            </>
          )
        case "milestone":
          return to ? (
            <>
              added this task to the milestone <Value>{to}</Value>.
            </>
          ) : (
            <>
              removed this task from the milestone <Value>{from}</Value>.
            </>
          )
        default: {
          const label =
            attributeLabels[attribute] ?? attribute.replace(/_/g, " ")
          return to ? (
            <>
              set the {label} to <Value>{to}</Value>.
            </>
          ) : (
            <>removed the {label}.</>
          )
        }
      }
    }
    default:
      return <>updated the task.</>
  }
}

// Plane's comment card: avatar, name "commented", time, (edited), a menu
// for the author, and the rich-text body.
function CommentCard({
  comment,
  author,
  users,
}: {
  comment: Comment
  author?: UserSummary
  users: UserSummary[]
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

  if (editing) {
    return (
      <div className="min-w-0 flex-1">
        <CommentInput
          users={users}
          initialBody={comment.body}
          autoFocus
          sending={saving}
          onSubmit={saveEdit}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-w-0 flex-1 rounded-xl border bg-card p-3 shadow-xs/5">
      <div className="flex items-center gap-2 text-xs">
        <UserAvatar name={author?.name} className="size-4 text-[0.5rem]" />
        <span className="font-medium">{author?.name ?? "Someone"}</span>
        <span className="text-muted-foreground">commented</span>
        <TimeAgo date={comment.created_at} />
        {comment.edited_at && <EditedMark date={comment.edited_at} />}
        {isOwn && (
          <Menu>
            <MenuTrigger
              render={
                <Button variant="ghost" size="icon-xs" className="ms-auto" />
              }
              aria-label="Comment actions"
            >
              <Ellipsis />
            </MenuTrigger>
            <MenuPopup align="end">
              <MenuItem onClick={() => setEditing(true)}>
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
        )}
      </div>
      <div
        className="rich-text mt-2 text-sm"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: comment bodies are sanitized server-side (RichDescription.sanitize)
        dangerouslySetInnerHTML={{ __html: comment.body }}
      />
    </div>
  )
}
