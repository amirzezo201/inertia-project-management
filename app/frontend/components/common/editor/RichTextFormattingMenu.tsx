import { type useEditor, useEditorState } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
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

import { RichTextMenuButton } from "./RichTextMenuButton"

export function RichTextFormattingMenu({
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
      // Text formatting only: not for a selected image, which has nothing to
      // make bold and would have the menu cover the content above it.
      shouldShow={({ editor, view, state }) =>
        view.hasFocus() && !state.selection.empty && !editor.isActive("image")
      }
      className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-lg/5"
    >
      <RichTextMenuButton
        label="Bold"
        active={active.bold}
        onClick={() => chain().toggleBold().run()}
      >
        <Bold />
      </RichTextMenuButton>
      <RichTextMenuButton
        label="Italic"
        active={active.italic}
        onClick={() => chain().toggleItalic().run()}
      >
        <Italic />
      </RichTextMenuButton>
      <RichTextMenuButton
        label="Strikethrough"
        active={active.strike}
        onClick={() => chain().toggleStrike().run()}
      >
        <Strikethrough />
      </RichTextMenuButton>
      <RichTextMenuButton
        label="Code"
        active={active.code}
        onClick={() => chain().toggleCode().run()}
      >
        <Code />
      </RichTextMenuButton>
      <span className="mx-0.5 h-4 w-px bg-border" />
      <RichTextMenuButton
        label="Heading"
        active={active.heading}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </RichTextMenuButton>
      <RichTextMenuButton
        label="Bullet list"
        active={active.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      >
        <List />
      </RichTextMenuButton>
      <RichTextMenuButton
        label="Numbered list"
        active={active.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered />
      </RichTextMenuButton>
      <RichTextMenuButton
        label="Checklist"
        active={active.taskList}
        onClick={() => chain().toggleTaskList().run()}
      >
        <ListChecks />
      </RichTextMenuButton>
    </BubbleMenu>
  )
}
