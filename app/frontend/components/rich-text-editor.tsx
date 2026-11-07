import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Mention } from "@tiptap/extension-mention"
import { Placeholder } from "@tiptap/extensions"
import {
  type Editor,
  EditorContent,
  useEditor,
  useEditorState,
} from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Code,
  Heading2,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Strikethrough,
} from "lucide-react"
import type { ReactNode } from "react"
import { useRef } from "react"

import { mentionSuggestion } from "@/components/mention-suggestion"
import { cn } from "@/lib/utils"
import type { UserSummary } from "@/types"

interface RichTextEditorProps {
  content?: string | null
  placeholder?: string
  autoFocus?: boolean
  className?: string
  onChange?: (html: string) => void
  onBlur?: (html: string) => void
  // Called on the submit key (see `submitOn`), e.g. to send a comment.
  onSubmit?: (html: string) => void
  // "enter" works like Huly's comment box: Enter sends, Shift+Enter breaks
  // the line. "mod-enter" keeps Enter for new paragraphs (⌘↵ submits).
  submitOn?: "enter" | "mod-enter"
  // People offered when typing "@"; leave out to disable mentions.
  mentions?: UserSummary[]
  // Rendered under the writing area with access to the editor (toolbars).
  footer?: (editor: Editor) => ReactNode
  // Classes for the writing area itself (height, padding).
  editorClassName?: string
}

// Match the server: drop trailing empty paragraphs; an empty document is "".
function serialize(html: string) {
  return html.replace(/(<p>\s*<\/p>)+$/, "")
}

// Huly-style rich text: no toolbar, Markdown shortcuts while typing ("# ",
// "- ", "1. ", "[ ] ", **bold**) and a formatting menu on text selection.
// Uses useEditor + EditorContent because the editor lives in this one component.
export function RichTextEditor({
  content,
  placeholder = "Add description…",
  autoFocus,
  className,
  onChange,
  onBlur,
  onSubmit,
  submitOn = "mod-enter",
  mentions,
  footer,
  editorClassName = "min-h-24",
}: RichTextEditorProps) {
  // The editor is configured once; read the latest values through refs.
  const submitRef = useRef(onSubmit)
  submitRef.current = onSubmit
  const mentionsRef = useRef(mentions ?? [])
  mentionsRef.current = mentions ?? []
  const pickingMentionRef = useRef(false)
  const htmlRef = useRef(content ?? "")

  const editor = useEditor({
    // SSR is enabled for Inertia pages; render the editor on the client only.
    immediatelyRender: false,
    autofocus: autoFocus ? "end" : false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
      ...(mentions
        ? [
            Mention.configure({
              suggestion: mentionSuggestion(
                () => mentionsRef.current,
                pickingMentionRef,
              ),
            }),
          ]
        : []),
    ],
    content: content ?? "",
    editorProps: {
      attributes: { class: cn("rich-text outline-none", editorClassName) },
      handleKeyDown: (_view, event) => {
        if (
          event.key !== "Enter" ||
          !submitRef.current ||
          pickingMentionRef.current
        ) {
          return false
        }

        const withModifier = event.metaKey || event.ctrlKey
        const submits =
          submitOn === "enter" ? !event.shiftKey && !withModifier : withModifier
        if (submits) {
          event.preventDefault()
          submitRef.current(htmlRef.current)
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      htmlRef.current = serialize(editor.getHTML())
      onChange?.(htmlRef.current)
    },
    onBlur: ({ editor }) => onBlur?.(serialize(editor.getHTML())),
  })

  return (
    <div className={cn("text-sm", className)}>
      {editor && <FormattingMenu editor={editor} />}
      <EditorContent editor={editor} />
      {editor && footer?.(editor)}
    </div>
  )
}

function FormattingMenu({
  editor,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      strike: editor.isActive("strike"),
      code: editor.isActive("code"),
      heading: editor.isActive("heading", { level: 2 }),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      taskList: editor.isActive("taskList"),
    }),
  })

  const chain = () => editor.chain().focus()

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-lg/5"
    >
      <MenuButton
        label="Bold"
        active={active.bold}
        onClick={() => chain().toggleBold().run()}
      >
        <Bold />
      </MenuButton>
      <MenuButton
        label="Italic"
        active={active.italic}
        onClick={() => chain().toggleItalic().run()}
      >
        <Italic />
      </MenuButton>
      <MenuButton
        label="Strikethrough"
        active={active.strike}
        onClick={() => chain().toggleStrike().run()}
      >
        <Strikethrough />
      </MenuButton>
      <MenuButton
        label="Code"
        active={active.code}
        onClick={() => chain().toggleCode().run()}
      >
        <Code />
      </MenuButton>
      <span className="mx-0.5 h-4 w-px bg-border" />
      <MenuButton
        label="Heading"
        active={active.heading}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </MenuButton>
      <MenuButton
        label="Bullet list"
        active={active.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      >
        <List />
      </MenuButton>
      <MenuButton
        label="Numbered list"
        active={active.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered />
      </MenuButton>
      <MenuButton
        label="Checklist"
        active={active.taskList}
        onClick={() => chain().toggleTaskList().run()}
      >
        <ListChecks />
      </MenuButton>
    </BubbleMenu>
  )
}

function MenuButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground [&_svg]:size-4",
        active && "bg-accent text-foreground",
      )}
    >
      {children}
    </button>
  )
}
