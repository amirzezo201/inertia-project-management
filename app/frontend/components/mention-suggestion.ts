import type { MentionNodeAttrs } from "@tiptap/extension-mention"
import { ReactRenderer } from "@tiptap/react"
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion"

import { MentionList, type MentionListHandle } from "@/components/mention-list"
import type { UserSummary } from "@/types"

type Selected = MentionNodeAttrs

// Suggestion config for Tiptap's Mention extension: filters people by the
// text after "@" and shows MentionList under the caret (above it when there's
// no room below). `openRef` tells the editor not to submit on Enter while the
// picker is open.
export function mentionSuggestion(
  getUsers: () => UserSummary[],
  openRef: { current: boolean },
): Omit<SuggestionOptions<UserSummary, Selected>, "editor"> {
  return {
    char: "@",
    items: ({ query }) =>
      getUsers()
        .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8),
    render: () => {
      let renderer: ReactRenderer<MentionListHandle> | null = null
      let popup: HTMLDivElement | null = null

      function place(props: SuggestionProps<UserSummary, Selected>) {
        const rect = props.clientRect?.()
        if (!rect || !popup) return

        const below = rect.bottom + 4
        const fitsBelow = below + popup.offsetHeight < window.innerHeight
        popup.style.left = `${rect.left}px`
        popup.style.top = `${fitsBelow ? below : rect.top - popup.offsetHeight - 4}px`
      }

      function close() {
        openRef.current = false
        popup?.remove()
        renderer?.destroy()
        popup = null
        renderer = null
      }

      return {
        onStart: (props) => {
          openRef.current = true
          renderer = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          })
          popup = document.createElement("div")
          popup.style.position = "fixed"
          popup.style.zIndex = "60"
          popup.appendChild(renderer.element)
          document.body.appendChild(popup)
          requestAnimationFrame(() => place(props))
        },
        onUpdate: (props) => {
          renderer?.updateProps(props)
          requestAnimationFrame(() => place(props))
        },
        onKeyDown: ({ event }) => {
          if (event.key === "Escape") {
            close()
            return true
          }
          return renderer?.ref?.onKeyDown(event) ?? false
        },
        onExit: close,
      }
    },
  }
}
