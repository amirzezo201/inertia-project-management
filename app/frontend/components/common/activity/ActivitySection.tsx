import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import type { ActivityEvent, Option } from "@/types"
import { getItem, setItem } from "@/utils/storage"

import { ActivityCommentComposer } from "./ActivityCommentComposer"
import { ActivityEntry } from "./ActivityEntry"

type Tab = "activity" | "comments"

const TAB_KEY = "runwell:activity-tab"
const NEWEST_FIRST_KEY = "runwell:activity-newest-first"

interface ActivitySectionProps {
  activity: ActivityEvent[]
  users: Option[]
  commentsPath: string
}

// A task's history in two tabs: Activity (the timeline of changes) and
// Comments (comment cards and the comment box, below the list when
// oldest-first, above it when newest-first), plus a sort toggle. Opens on
// Comments, so the comment box is there from the start.
export function ActivitySection({
  activity,
  users,
  commentsPath,
}: ActivitySectionProps) {
  const [tab, setTab] = useState<Tab>("comments")
  const [newestFirst, setNewestFirst] = useState(false)

  useEffect(() => {
    const savedTab = getItem(TAB_KEY)
    // A saved "all" (the tab this replaced) falls back to Comments.
    if (savedTab === "activity" || savedTab === "comments") setTab(savedTab)
    setNewestFirst(getItem(NEWEST_FIRST_KEY) === "true")
  }, [])

  const visible = activity.filter((event) =>
    tab === "comments"
      ? event.action === "comment_created"
      : event.action !== "comment_created",
  )
  const ordered = newestFirst ? [...visible].reverse() : visible
  const showComposer = tab === "comments"
  const composer = (
    <ActivityCommentComposer commentsPath={commentsPath} users={users} />
  )

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
