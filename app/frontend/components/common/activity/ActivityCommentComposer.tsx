import { router, usePage } from "@inertiajs/react"
import { useState } from "react"

import type { Option } from "@/types"

import { CommentInput } from "./CommentInput"

export function ActivityCommentComposer({
  commentsPath,
  users,
}: {
  commentsPath: string
  users: Option[]
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
