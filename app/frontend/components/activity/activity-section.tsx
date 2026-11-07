import { router, usePage } from "@inertiajs/react"
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react"
import { useEffect, useState } from "react"

import { ActivityEntry } from "@/components/activity/activity-entry"
import { CommentInput } from "@/components/activity/comment-input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { getItem, setItem } from "@/lib/storage"
import type { ActivityEvent, UserSummary } from "@/types"

type Tab = "all" | "activity" | "comments"

const TAB_KEY = "runwell:activity-tab"
const NEWEST_FIRST_KEY = "runwell:activity-newest-first"

interface ActivitySectionProps {
  activity: ActivityEvent[]
  users: UserSummary[]
  commentsPath: string
}

// Plane's activity: All / Activity / Comments tabs, a sort toggle, a
// timeline of changes and comment cards, and the comment box (below the
// list when oldest-first, above it when newest-first).
export function ActivitySection({
  activity,
  users,
  commentsPath,
}: ActivitySectionProps) {
  const [tab, setTab] = useState<Tab>("all")
  const [newestFirst, setNewestFirst] = useState(false)

  useEffect(() => {
    const savedTab = getItem(TAB_KEY)
    if (
      savedTab === "all" ||
      savedTab === "activity" ||
      savedTab === "comments"
    )
      setTab(savedTab)
    setNewestFirst(getItem(NEWEST_FIRST_KEY) === "true")
  }, [])

  const visible = activity.filter((event) =>
    tab === "all"
      ? true
      : tab === "comments"
        ? event.action === "comment_created"
        : event.action !== "comment_created",
  )
  const ordered = newestFirst ? [...visible].reverse() : visible
  const showComposer = tab !== "activity"
  const composer = <CommentComposer commentsPath={commentsPath} users={users} />

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b">
        <h2 className="sr-only">Activity</h2>
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as Tab)
            setItem(TAB_KEY, String(value))
          }}
        >
          <TabsList variant="underline">
            <TabsTab value="all">All</TabsTab>
            <TabsTab value="activity">Activity</TabsTab>
            <TabsTab value="comments">Comments</TabsTab>
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ms-auto"
          aria-label={newestFirst ? "Show oldest first" : "Show newest first"}
          title={newestFirst ? "Newest first" : "Oldest first"}
          onClick={() => {
            setNewestFirst(!newestFirst)
            setItem(NEWEST_FIRST_KEY, String(!newestFirst))
          }}
        >
          {newestFirst ? <ArrowDownWideNarrow /> : <ArrowUpNarrowWide />}
        </Button>
      </div>

      {showComposer && newestFirst && composer}

      {ordered.length > 0 ? (
        <ol className="flex flex-col">
          {ordered.map((event, index) => (
            <ActivityEntry
              key={event.id}
              event={event}
              users={users}
              last={index === ordered.length - 1}
            />
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground text-sm">
          {tab === "comments" ? "No comments yet" : "No activity yet"}
        </p>
      )}

      {showComposer && !newestFirst && composer}
    </section>
  )
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
