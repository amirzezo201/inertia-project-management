import { Smile } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"

const EMOJI = [
  "👍",
  "👎",
  "👏",
  "🙌",
  "🙏",
  "💪",
  "👀",
  "🤔",
  "😀",
  "😄",
  "😂",
  "🙂",
  "😉",
  "😍",
  "😎",
  "🥳",
  "😅",
  "😬",
  "😢",
  "😡",
  "🤯",
  "😴",
  "🤝",
  "✌️",
  "✅",
  "❌",
  "⚠️",
  "❓",
  "❗",
  "💡",
  "🔥",
  "⭐",
  "🎉",
  "🚀",
  "🐛",
  "🔧",
  "📌",
  "📎",
  "📝",
  "⏰",
]

// Huly's emoji button in the comment toolbar: pick one to insert it.
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button type="button" variant="ghost" size="icon-sm" />}
        aria-label="Emoji"
        title="Emoji"
      >
        <Smile />
      </PopoverTrigger>
      <PopoverPopup side="top" align="start" className="w-auto">
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={emoji}
              className="flex size-8 items-center justify-center rounded-md text-lg hover:bg-accent"
              onClick={() => {
                onPick(emoji)
                setOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverPopup>
    </Popover>
  )
}
