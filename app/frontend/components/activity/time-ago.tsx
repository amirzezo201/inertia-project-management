import { useEffect, useState } from "react"

import { fullDateTime, timeAgo } from "@/lib/time"
import { cn } from "@/lib/utils"

// "5 minutes ago", kept fresh every minute. Server rendering can't know the
// viewer's clock or time zone, so the text and tooltip fill in after mount;
// rendering them on the server would mismatch during hydration.
export function TimeAgo({
  date,
  className,
}: {
  date: string
  className?: string
}) {
  const [, setTick] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = window.setInterval(
      () => setTick((tick) => tick + 1),
      60_000,
    )
    return () => window.clearInterval(interval)
  }, [])

  return (
    <time
      dateTime={date}
      title={mounted ? fullDateTime(date) : undefined}
      className={cn("text-muted-foreground text-xs", className)}
    >
      {mounted ? timeAgo(date) : ""}
    </time>
  )
}

// "(edited)", with the edit time as a tooltip once mounted (see TimeAgo).
export function EditedMark({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <span
      className="text-muted-foreground text-xs"
      title={mounted ? `Edited ${fullDateTime(date)}` : undefined}
    >
      (edited)
    </span>
  )
}
