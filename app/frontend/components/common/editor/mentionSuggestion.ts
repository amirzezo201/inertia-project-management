import type { MentionNodeAttrs } from "@tiptap/extension-mention"
import type { SuggestionOptions } from "@tiptap/suggestion"

import { MentionList } from "@/components/common/editor/MentionList"
import { suggestionPopup } from "@/components/common/editor/suggestionPopup"
import type { Option } from "@/types"

// Suggestion config for Tiptap's Mention extension: filters people by the
// text after "@".
export function mentionSuggestion(
  getUsers: () => Option[],
  openRef: { current: boolean },
): Omit<SuggestionOptions<Option, MentionNodeAttrs>, "editor"> {
  return {
    char: "@",
    items: ({ query }) =>
      getUsers()
        .filter((user) =>
          user.label.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 8),
    render: suggestionPopup<Option, MentionNodeAttrs>(MentionList, openRef),
  }
}
