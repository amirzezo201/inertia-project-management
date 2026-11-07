import { useState } from "react"

import { RichTextEditor } from "@/components/common/editor/RichTextEditor"
import { Button } from "@/components/ui/button"
import type { Option } from "@/types"

import { CommentFormattingToolbar } from "./CommentFormattingToolbar"

interface CommentInputProps {
  users: Option[]
  onSubmit: (html: string) => void
  // Editing an existing comment: start from its body and offer Cancel.
  initialBody?: string
  onCancel?: () => void
  sending?: boolean
  autoFocus?: boolean
}

function isBlank(html: string) {
  return html.replace(/<[^>]*>/g, "").trim() === ""
}

// Plane's comment box: a rounded writing area, a formatting toolbar along
// the bottom and a "Comment" button. Enter submits, Shift+Enter starts a new
// line, and "@" mentions someone.
export function CommentInput({
  users,
  onSubmit,
  initialBody = "",
  onCancel,
  sending,
  autoFocus,
}: CommentInputProps) {
  const [body, setBody] = useState(initialBody)

  function submit(html: string) {
    if (!isBlank(html) && !sending) onSubmit(html)
  }

  return (
    <div className="rounded-xl border bg-muted/24 transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 hover:border-ring/40">
      <RichTextEditor
        content={initialBody}
        autoFocus={autoFocus}
        placeholder="Add comment"
        editorClassName="min-h-16 max-h-[200px] overflow-y-auto p-3"
        submitOn="enter"
        mentions={users}
        onChange={setBody}
        onSubmit={submit}
        footer={(editor) => (
          <div className="flex min-h-9 items-center justify-between gap-2 pr-1.5 pb-1.5 pl-1">
            <CommentFormattingToolbar editor={editor} />
            <div className="flex items-center gap-1">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBlank(body)}
                loading={sending}
                onClick={() => submit(body)}
              >
                {onCancel ? "Save" : "Comment"}
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  )
}
