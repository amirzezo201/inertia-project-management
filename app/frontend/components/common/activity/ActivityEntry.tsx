import {
  CalendarDays,
  CircleDot,
  Clock,
  Flag,
  ListTree,
  MessageSquare,
  Plus,
  SignalHigh,
  Type,
  UserRound,
} from "lucide-react"
import type { ReactNode } from "react"

import { TimeAgo } from "@/components/common/TimeAgo"
import type { ActivityEvent, Option } from "@/types"

import { ActivityCommentCard } from "./ActivityCommentCard"
import { ActivityEventDescription } from "./ActivityEventDescription"

interface ActivityEntryProps {
  event: ActivityEvent
  users: Option[]
  // The last entry has no connecting line below its icon.
  last: boolean
}

// One step on Plane's activity timeline: an icon box on the rail, then
// either a change ("Ann set the status to Done · 2 hours ago") or a comment card.
export function ActivityEntry({ event, users, last }: ActivityEntryProps) {
  const author = users.find((user) => user.value === String(event.creator_id))

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
        <ActivityCommentCard
          comment={event.comment}
          author={author}
          users={users}
        />
      ) : (
        <p className="min-w-0 flex-1 pt-1 text-muted-foreground text-xs leading-5">
          <span className="font-medium text-foreground">
            {author?.label ?? "Someone"}
          </span>{" "}
          <ActivityEventDescription event={event} />{" "}
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
