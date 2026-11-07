import { AtSign, Check, Send, X } from "lucide-react"
import { useState } from "react"

import { EmojiPicker } from "@/components/activity/emoji-picker"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Button } from "@/components/ui/button"
import type { UserSummary } from "@/types"

interface CommentInputProps {
  users: UserSummary[]
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

// Huly's comment box (ReferenceInput): a bordered writing area, a toolbar of
// ghost buttons (Mention, Emoji) and Send on the right. Enter sends,
// Shift+Enter starts a new line, "@" mentions someone.
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
    <div className="rounded-lg border bg-background transition-colors focus-within:border-ring">
      <RichTextEditor
        content={initialBody}
        autoFocus={autoFocus}
        placeholder="Start typing..."
        editorClassName="min-h-11 px-3 pt-2.5 pb-1"
        submitOn="enter"
        mentions={users}
        onChange={setBody}
        onSubmit={submit}
        footer={(editor) => (
          <div className="flex items-center justify-between gap-2 px-1.5 pb-1.5">
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Mention"
                title="Mention"
                onClick={() => editor.chain().focus().insertContent("@").run()}
              >
                <AtSign />
              </Button>
              <EmojiPicker
                onPick={(emoji) =>
                  editor.chain().focus().insertContent(emoji).run()
                }
              />
            </div>

            <div className="flex items-center gap-1">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Cancel"
                  title="Cancel"
                  onClick={onCancel}
                >
                  <X />
                </Button>
              )}
              <Button
                type="button"
                size="icon-sm"
                aria-label={onCancel ? "Save" : "Send"}
                title={onCancel ? "Save" : "Send"}
                disabled={isBlank(body)}
                loading={sending}
                onClick={() => submit(body)}
              >
                {onCancel ? <Check /> : <Send />}
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  )
}
