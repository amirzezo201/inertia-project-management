import { PluginKey } from "@tiptap/pm/state"
import { type Editor, Extension, type Range } from "@tiptap/react"
import Suggestion from "@tiptap/suggestion"
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Type,
} from "lucide-react"
import type { ReactNode } from "react"

import { SlashCommandList } from "./SlashCommandList"
import { suggestionPopup } from "./suggestionPopup"

export interface SlashCommand {
  key: string
  title: string
  description: string
  icon: ReactNode
  searchTerms: string[]
  run: (editor: Editor, range: Range) => void
}

// Plane's "/" commands (titles and descriptions as in Plane), limited to
// blocks our editor and sanitizer support.
const COMMANDS: SlashCommand[] = [
  {
    key: "text",
    title: "Text",
    description: "Just start typing with plain text.",
    icon: <Type />,
    searchTerms: ["p", "paragraph"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    key: "h1",
    title: "Heading 1",
    description: "Big section heading.",
    icon: <Heading1 />,
    searchTerms: ["title", "big", "large"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    key: "h2",
    title: "Heading 2",
    description: "Medium section heading.",
    icon: <Heading2 />,
    searchTerms: ["subtitle", "medium"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    key: "h3",
    title: "Heading 3",
    description: "Small section heading.",
    icon: <Heading3 />,
    searchTerms: ["subtitle", "small"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    key: "numbered-list",
    title: "Numbered list",
    description: "Create a numbered list.",
    icon: <ListOrdered />,
    searchTerms: ["ordered", "ol"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    key: "bulleted-list",
    title: "Bulleted list",
    description: "Create a bulleted list.",
    icon: <List />,
    searchTerms: ["unordered", "ul", "point"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    key: "to-do-list",
    title: "To-do list",
    description: "Create a to-do list.",
    icon: <ListChecks />,
    searchTerms: ["todo", "task", "checkbox", "check"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    key: "quote",
    title: "Quote",
    description: "Capture a quote.",
    icon: <Quote />,
    searchTerms: ["blockquote"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    key: "code",
    title: "Code",
    description: "Capture a code snippet.",
    icon: <Code />,
    searchTerms: ["codeblock", "snippet"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    key: "divider",
    title: "Divider",
    description: "Visually divide blocks.",
    icon: <Minus />,
    searchTerms: ["line", "hr", "separator"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
]

function matches(command: SlashCommand, query: string) {
  const q = query.toLowerCase()
  return (
    command.title.toLowerCase().includes(q) ||
    command.searchTerms.some((term) => term.includes(q))
  )
}

// A Tiptap extension: typing "/" opens the command menu.
export function SlashCommands(openRef: { current: boolean }) {
  return Extension.create({
    name: "slashCommands",
    addProseMirrorPlugins() {
      return [
        Suggestion<SlashCommand, SlashCommand>({
          editor: this.editor,
          pluginKey: new PluginKey("slashCommands"),
          char: "/",
          items: ({ query }) =>
            COMMANDS.filter((command) => matches(command, query)),
          command: ({ editor, range, props }) => props.run(editor, range),
          render: suggestionPopup<SlashCommand, SlashCommand>(
            SlashCommandList,
            openRef,
          ),
        }),
      ]
    },
  })
}
