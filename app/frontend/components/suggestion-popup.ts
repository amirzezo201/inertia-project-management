import { ReactRenderer } from "@tiptap/react"
import type {
  SuggestionKeyDownProps,
  SuggestionProps,
} from "@tiptap/suggestion"
import type { ComponentType } from "react"

export interface SuggestionListHandle {
  onKeyDown: (event: KeyboardEvent) => boolean
}

// Shows a Tiptap suggestion (the "@" people picker, the "/" command menu)
// in a floating box under the caret, or above it when there's no room.
// `openRef` lets the editor skip "Enter to submit" while a menu is open.
export function suggestionPopup<I, S>(
  // biome-ignore lint/suspicious/noExplicitAny: ReactRenderer accepts any component taking the suggestion props
  Component: ComponentType<any>,
  openRef: { current: boolean },
) {
  return () => {
    let renderer: ReactRenderer<SuggestionListHandle> | null = null
    let popup: HTMLDivElement | null = null

    function place(props: SuggestionProps<I, S>) {
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
      onStart: (props: SuggestionProps<I, S>) => {
        openRef.current = true
        renderer = new ReactRenderer(Component, { props, editor: props.editor })
        popup = document.createElement("div")
        popup.style.position = "fixed"
        popup.style.zIndex = "60"
        popup.appendChild(renderer.element)
        document.body.appendChild(popup)
        requestAnimationFrame(() => place(props))
      },
      onUpdate: (props: SuggestionProps<I, S>) => {
        renderer?.updateProps(props)
        requestAnimationFrame(() => place(props))
      },
      onKeyDown: ({ event }: SuggestionKeyDownProps) => {
        if (event.key === "Escape") {
          close()
          return true
        }
        return renderer?.ref?.onKeyDown(event) ?? false
      },
      onExit: close,
    }
  }
}
