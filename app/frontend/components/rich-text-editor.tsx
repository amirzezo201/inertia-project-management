import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Placeholder } from "@tiptap/extensions"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
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

import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  content?: string | null
  placeholder?: string
  autoFocus?: boolean
  className?: string
  onChange?: (html: string) => void
  onBlur?: (html: string) => void
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
}: RichTextEditorProps) {
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
    ],
    content: content ?? "",
    editorProps: {
      attributes: { class: "rich-text min-h-24 outline-none" },
    },
    onUpdate: ({ editor }) => onChange?.(serialize(editor.getHTML())),
    onBlur: ({ editor }) => onBlur?.(serialize(editor.getHTML())),
  })

  return (
    <div className={cn("text-sm", className)}>
      {editor && <FormattingMenu editor={editor} />}
      <EditorContent editor={editor} />
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
