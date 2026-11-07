import type { MentionNodeAttrs } from "@tiptap/extension-mention"
import type { SuggestionOptions } from "@tiptap/suggestion"

import { MentionList } from "@/components/mention-list"
import { suggestionPopup } from "@/components/suggestion-popup"
import type { UserSummary } from "@/types"

// Suggestion config for Tiptap's Mention extension: filters people by the
// text after "@".
export function mentionSuggestion(
  getUsers: () => UserSummary[],
  openRef: { current: boolean },
): Omit<SuggestionOptions<UserSummary, MentionNodeAttrs>, "editor"> {
  return {
    char: "@",
    items: ({ query }) =>
      getUsers()
        .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8),
    render: suggestionPopup<UserSummary, MentionNodeAttrs>(
      MentionList,
      openRef,
    ),
  }
}
