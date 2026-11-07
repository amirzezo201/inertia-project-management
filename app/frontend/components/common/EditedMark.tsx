import { useEffect, useState } from "react"

import { fullDateTime } from "@/utils/time"

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
