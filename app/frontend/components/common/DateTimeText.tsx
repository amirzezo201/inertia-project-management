import { useEffect, useState } from "react"

import { fullDateTime } from "@/utils/time"

// A full date and time ("Nov 7, 2026, 12:57 PM"), filled in after mount for
// the same hydration reason as TimeAgo.
export function DateTimeText({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return <time dateTime={date}>{mounted ? fullDateTime(date) : ""}</time>
}
