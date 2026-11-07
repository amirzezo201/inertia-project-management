import type { MentionNodeAttrs } from "@tiptap/extension-mention"
import type { SuggestionProps } from "@tiptap/suggestion"
import { type Ref, useImperativeHandle, useState } from "react"

import { UserAvatar } from "@/components/activity/user-avatar"
import { cn } from "@/lib/utils"
import type { UserSummary } from "@/types"

export interface MentionListHandle {
  onKeyDown: (event: KeyboardEvent) => boolean
}

type MentionListProps = SuggestionProps<UserSummary, MentionNodeAttrs> & {
  ref?: Ref<MentionListHandle>
}

// The people picker shown while typing "@name", like Huly's mention popup.
export function MentionList({ items, command, ref }: MentionListProps) {
  const [selected, setSelected] = useState(0)
  // Start from the top whenever the matches change (state adjusted during
  // render, as React recommends over an effect).
  const [shownItems, setShownItems] = useState(items)
  if (items !== shownItems) {
    setShownItems(items)
    setSelected(0)
  }

  function pick(index: number) {
    const user = items[index]
    if (user) command({ id: String(user.id), label: user.name })
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
        pick(selected)
        return true
      }
      return false
    },
  }))

  return (
    <div className="min-w-48 rounded-lg border bg-popover p-1 text-popover-foreground text-sm shadow-lg/5">
      {items.length === 0 ? (
        <p className="px-2 py-1.5 text-muted-foreground">No one found</p>
      ) : (
        items.map((user, index) => (
          <button
            key={user.id}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault()
              pick(index)
            }}
            onMouseEnter={() => setSelected(index)}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left",
              index === selected && "bg-accent text-accent-foreground",
            )}
          >
            <UserAvatar name={user.name} className="size-5" />
            {user.name}
          </button>
        ))
      )}
    </div>
  )
}
