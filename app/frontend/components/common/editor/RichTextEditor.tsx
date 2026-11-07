import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Mention } from "@tiptap/extension-mention"
import { Placeholder } from "@tiptap/extensions"
import { type Editor, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import type { ReactNode } from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import type { Option } from "@/types"

import { mentionSuggestion } from "./mentionSuggestion"
import { RichTextFormattingMenu } from "./RichTextFormattingMenu"
import { SlashCommands } from "./SlashCommands"

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
  mentions?: Option[]
  // Plane's "/" block menu (headings, lists, quote, code, divider). The
  // placeholder then reads "Press '/' for commands" while focused.
  slashCommands?: boolean
  // Rendered under the writing area with access to the editor (toolbars).
  footer?: (editor: Editor) => ReactNode
  // Classes for the writing area itself (height, padding).
  editorClassName?: string
  // Files pasted or dropped into the text are uploaded through this; the
  // images among them are embedded where they landed. Leave out to disable.
  uploadFiles?: (files: File[]) => Promise<EmbeddableFile[]>
  // Called with the document after images were embedded, so it can be saved
  // without waiting for the editor to lose focus.
  onEmbed?: (html: string) => void
}

export interface EmbeddableFile {
  url: string
  filename: string
  contentType: string
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
  slashCommands = false,
  footer,
  editorClassName = "min-h-24",
  uploadFiles,
  onEmbed,
}: RichTextEditorProps) {
  // The editor is configured once; read the latest values through refs.
  const submitRef = useRef(onSubmit)
  submitRef.current = onSubmit
  const mentionsRef = useRef(mentions ?? [])
  mentionsRef.current = mentions ?? []
  // True while the "@" or "/" menu is open, so Enter picks instead of submitting.
  const menuOpenRef = useRef(false)
  const htmlRef = useRef(content ?? "")
  const uploadFilesRef = useRef(uploadFiles)
  uploadFilesRef.current = uploadFiles
  const onEmbedRef = useRef(onEmbed)
  onEmbedRef.current = onEmbed
  const editorRef = useRef<Editor | null>(null)

  // Uploads the files, then embeds the images among them at `position` (or at
  // the caret), and hands the new document to onEmbed.
  async function embedFiles(files: File[], position: number | null) {
    const uploaded = (await uploadFilesRef.current?.(files)) ?? []
    const images = uploaded.filter((file) =>
      file.contentType.startsWith("image/"),
    )
    const editor = editorRef.current
    if (!editor || images.length === 0) return

    editor
      .chain()
      .insertContentAt(
        position ?? editor.state.selection.to,
        images.map((image) => ({
          type: "image",
          attrs: { src: image.url, alt: image.filename },
        })),
      )
      .run()
    onEmbedRef.current?.(htmlRef.current)
  }

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
      ...(uploadFiles ? [Image.configure({ allowBase64: false })] : []),
      Placeholder.configure({
        placeholder: ({ editor }) =>
          slashCommands && (editor.isFocused || !editor.isEmpty)
            ? "Press '/' for commands"
            : placeholder,
      }),
      ...(slashCommands ? [SlashCommands(menuOpenRef)] : []),
      ...(mentions
        ? [
            Mention.configure({
              suggestion: mentionSuggestion(
                () => mentionsRef.current,
                menuOpenRef,
              ),
            }),
          ]
        : []),
    ],
    content: content ?? "",
    editorProps: {
      attributes: { class: cn("rich-text outline-none", editorClassName) },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? [])
        if (!uploadFilesRef.current || files.length === 0) return false
        event.preventDefault()
        void embedFiles(files, null)
        return true
      },
      handleDrop: (view, event, _slice, moved) => {
        const files = Array.from(event.dataTransfer?.files ?? [])
        if (moved || !uploadFilesRef.current || files.length === 0) return false
        event.preventDefault()
        const position = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })
        void embedFiles(files, position?.pos ?? null)
        return true
      },
      handleKeyDown: (_view, event) => {
        if (
          event.key !== "Enter" ||
          !submitRef.current ||
          menuOpenRef.current
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
    onFocus: ({ editor }) => {
      if (slashCommands) editor.view.dispatch(editor.state.tr)
    },
    onBlur: ({ editor }) => {
      if (slashCommands) editor.view.dispatch(editor.state.tr)
      onBlur?.(serialize(editor.getHTML()))
    },
  })

  editorRef.current = editor

  return (
    <div className={cn("text-sm", className)}>
      {editor && <RichTextFormattingMenu editor={editor} />}
      <EditorContent editor={editor} />
      {editor && footer?.(editor)}
    </div>
  )
}
