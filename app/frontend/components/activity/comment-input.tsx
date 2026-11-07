import { type Editor, useEditorState } from "@tiptap/react"
import {
  AtSign,
  Bold,
  Code,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react"
import { Fragment, type ReactNode, useState } from "react"

import { RichTextEditor } from "@/components/rich-text-editor"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
            <FormattingToolbar editor={editor} />
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

interface ToolbarAction {
  label: string
  icon: ReactNode
  active?: boolean
  run: () => void
}

// Plane's lite-editor toolbar: text styles | lists | quote & code, plus @.
function FormattingToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      taskList: editor.isActive("taskList"),
      blockquote: editor.isActive("blockquote"),
      code: editor.isActive("code"),
    }),
  })
  const chain = () => editor.chain().focus()

  const groups: ToolbarAction[][] = [
    [
      {
        label: "Bold (⌘B)",
        icon: <Bold />,
        active: state.bold,
        run: () => chain().toggleBold().run(),
      },
      {
        label: "Italic (⌘I)",
        icon: <Italic />,
        active: state.italic,
        run: () => chain().toggleItalic().run(),
      },
      {
        label: "Underline (⌘U)",
        icon: <Underline />,
        active: state.underline,
        run: () => chain().toggleUnderline().run(),
      },
      {
        label: "Strikethrough (⌘⇧S)",
        icon: <Strikethrough />,
        active: state.strike,
        run: () => chain().toggleStrike().run(),
      },
    ],
    [
      {
        label: "Bulleted list",
        icon: <List />,
        active: state.bulletList,
        run: () => chain().toggleBulletList().run(),
      },
      {
        label: "Numbered list",
        icon: <ListOrdered />,
        active: state.orderedList,
        run: () => chain().toggleOrderedList().run(),
      },
      {
        label: "To-do list",
        icon: <ListChecks />,
        active: state.taskList,
        run: () => chain().toggleTaskList().run(),
      },
    ],
    [
      {
        label: "Quote",
        icon: <Quote />,
        active: state.blockquote,
        run: () => chain().toggleBlockquote().run(),
      },
      {
        label: "Code",
        icon: <Code />,
        active: state.code,
        run: () => chain().toggleCode().run(),
      },
    ],
    [
      {
        label: "Mention",
        icon: <AtSign />,
        run: () => chain().insertContent("@").run(),
      },
    ],
  ]

  return (
    <div className="flex flex-wrap items-center">
      {groups.map((group, index) => (
        <Fragment key={group[0].label}>
          {index > 0 && (
            <span aria-hidden className="mx-1 h-4 w-px bg-border" />
          )}
          {group.map((action) => (
            <button
              key={action.label}
              type="button"
              aria-label={action.label}
              aria-pressed={action.active ?? undefined}
              title={action.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={action.run}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-3.5",
                action.active && "bg-accent text-foreground",
              )}
            >
              {action.icon}
            </button>
          ))}
        </Fragment>
      ))}
    </div>
  )
}
