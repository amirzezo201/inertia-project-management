import type { SuggestionProps } from "@tiptap/suggestion"
import { type Ref, useImperativeHandle, useState } from "react"

import { cn } from "@/lib/utils"

import type { SlashCommand } from "./SlashCommands"
import type { SuggestionListHandle } from "./suggestionPopup"

type SlashCommandListProps = SuggestionProps<SlashCommand, SlashCommand> & {
  ref?: Ref<SuggestionListHandle>
}

export function SlashCommandList({
  items,
  command,
  ref,
}: SlashCommandListProps) {
  const [selected, setSelected] = useState(0)
  // Start from the top whenever the matches change.
  const [shownItems, setShownItems] = useState(items)
  if (items !== shownItems) {
    setShownItems(items)
    setSelected(0)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (event.key === "ArrowDown") {
        setSelected((index) => (index + 1) % Math.max(items.length, 1))
        return true
      }
      if (event.key === "ArrowUp") {
        setSelected(
          (index) => (index - 1 + items.length) % Math.max(items.length, 1),
        )
        return true
      }
      if (event.key === "Enter" || event.key === "Tab") {
        const item = items[selected]
        if (item) command(item)
        return true
      }
      return false
    },
  }))

  return (
    <div className="max-h-80 w-64 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground text-sm shadow-lg/5">
      {items.length === 0 ? (
        <p className="px-2 py-1.5 text-muted-foreground">No results</p>
      ) : (
        items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault()
              command(item)
            }}
            onMouseEnter={() => setSelected(index)}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left",
              index === selected && "bg-accent text-accent-foreground",
            )}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground [&_svg]:size-3.5">
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className="block">{item.title}</span>
              <span className="block truncate text-muted-foreground text-xs">
                {item.description}
              </span>
            </span>
          </button>
        ))
      )}
    </div>
  )
}
