import { router, usePage } from "@inertiajs/react"
import { ListFilter } from "lucide-react"
import { useEffect, useState } from "react"

import { ActivityEntry } from "@/components/activity/activity-entry"
import { CommentInput } from "@/components/activity/comment-input"
import { Button } from "@/components/ui/button"
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { getItem, setItem } from "@/lib/storage"
import type { ActivityEvent, UserSummary } from "@/types"

type Filter = "all" | "attributes" | "comments"

const NEWEST_FIRST_KEY = "runwell:activity-newest-first"
// Huly groups messages from the same person posted within 15 minutes.
const GROUP_WINDOW_MS = 15 * 60 * 1000

interface ActivitySectionProps {
  activity: ActivityEvent[]
  users: UserSummary[]
  commentsPath: string
}

// Huly's document activity: changes and comments in one feed, a filter
// (All / Attributes / Comments, newest first) and a comment box.
export function ActivitySection({
  activity,
  users,
  commentsPath,
}: ActivitySectionProps) {
  const [filter, setFilter] = useState<Filter>("all")
  const [newestFirst, setNewestFirst] = useState(false)

  useEffect(() => setNewestFirst(getItem(NEWEST_FIRST_KEY) === "true"), [])

  const visible = activity.filter((event) =>
    filter === "all"
      ? true
      : filter === "comments"
        ? event.action === "comment_created"
        : event.action !== "comment_created",
  )
  const ordered = newestFirst ? [...visible].reverse() : visible
  const composer = <CommentComposer commentsPath={commentsPath} users={users} />

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-sm">Activity</h2>
        <Menu>
          <MenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="ms-auto" />
            }
            aria-label="Filter activity"
            title="Filter activity"
          >
            <ListFilter />
          </MenuTrigger>
          <MenuPopup align="end" className="min-w-44">
            <MenuGroup>
              <MenuGroupLabel>Show</MenuGroupLabel>
              <MenuRadioGroup
                value={filter}
                onValueChange={(value) => setFilter(value as Filter)}
              >
                <MenuRadioItem value="all">All</MenuRadioItem>
                <MenuRadioItem value="attributes">Attributes</MenuRadioItem>
                <MenuRadioItem value="comments">Comments</MenuRadioItem>
              </MenuRadioGroup>
            </MenuGroup>
            <MenuSeparator />
            <MenuCheckboxItem
              checked={newestFirst}
              onCheckedChange={(checked) => {
                setNewestFirst(checked)
                setItem(NEWEST_FIRST_KEY, String(checked))
              }}
            >
              Newest first
            </MenuCheckboxItem>
          </MenuPopup>
        </Menu>
      </div>

      {newestFirst && composer}

      {ordered.length > 0 ? (
        <ol className="flex flex-col">
          {ordered.map((event, index) => (
            <ActivityEntry
              key={event.id}
              event={event}
              users={users}
              grouped={canGroup(event, ordered[index - 1])}
            />
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground text-sm">Nothing here yet.</p>
      )}

      {!newestFirst && composer}
    </section>
  )
}

// Same rule as Huly's canGroupMessages: same author, same kind of entry,
// same hour, less than 15 minutes apart. UTC hours keep server and browser
// rendering identical.
function canGroup(event: ActivityEvent, previous?: ActivityEvent) {
  if (!previous) return false
  if (event.creator_id !== previous.creator_id) return false
  if (
    (event.action === "comment_created") !==
    (previous.action === "comment_created")
  )
    return false

  const time = new Date(event.created_at).getTime()
  const previousTime = new Date(previous.created_at).getTime()
  const sameHour =
    new Date(time).getUTCHours() === new Date(previousTime).getUTCHours()
  return sameHour && Math.abs(time - previousTime) < GROUP_WINDOW_MS
}

function CommentComposer({
  commentsPath,
  users,
}: {
  commentsPath: string
  users: UserSummary[]
}) {
  const { errors } = usePage().props
  const [sending, setSending] = useState(false)
  // Bumped after sending to clear the box.
  const [inputKey, setInputKey] = useState(0)

  function send(html: string) {
    router.post(
      commentsPath,
      { body: html },
      {
        preserveScroll: true,
        preserveState: true,
        onStart: () => setSending(true),
        onFinish: () => setSending(false),
        onSuccess: () => setInputKey((key) => key + 1),
      },
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <CommentInput
        key={inputKey}
        users={users}
        sending={sending}
        onSubmit={send}
      />
      {errors.body && (
        <p className="text-destructive-foreground text-sm">
          Comment {[errors.body].flat().join(" ")}
        </p>
      )}
    </div>
  )
}
