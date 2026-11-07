import { router, usePage } from "@inertiajs/react"
import { Ellipsis, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

import { EditedMark } from "@/components/common/EditedMark"
import { TimeAgo } from "@/components/common/TimeAgo"
import { UserAvatar } from "@/components/common/UserAvatar"
import { Button } from "@/components/ui/button"
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu"
import { commentPath } from "@/routes"
import type { Comment, Option } from "@/types"

import { CommentInput } from "./CommentInput"

// Plane's comment card: avatar, name "commented", time, (edited), a menu
// for the author, and the rich-text body.
export function ActivityCommentCard({
  comment,
  author,
  users,
}: {
  comment: Comment
  author?: Option
  users: Option[]
}) {
  const { auth } = usePage().props
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const isOwn = comment.creator_id === auth.user.id

  function saveEdit(body: string) {
    router.patch(
      commentPath(comment.id),
      { body },
      {
        preserveScroll: true,
        preserveState: true,
        onStart: () => setSaving(true),
        onFinish: () => setSaving(false),
        onSuccess: () => setEditing(false),
      },
    )
  }

  if (editing) {
    return (
      <div className="min-w-0 flex-1">
        <CommentInput
          users={users}
          initialBody={comment.body}
          autoFocus
          sending={saving}
          onSubmit={saveEdit}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-w-0 flex-1 rounded-xl border bg-card p-3 shadow-xs/5">
      <div className="flex items-center gap-2 text-xs">
        <UserAvatar name={author?.label} className="size-4 text-[0.5rem]" />
        <span className="font-medium">{author?.label ?? "Someone"}</span>
        <span className="text-muted-foreground">commented</span>
        <TimeAgo date={comment.created_at} />
        {comment.edited_at && <EditedMark date={comment.edited_at} />}
        {isOwn && (
          <Menu>
            <MenuTrigger
              render={
                <Button variant="ghost" size="icon-xs" className="ms-auto" />
              }
              aria-label="Comment actions"
            >
              <Ellipsis />
            </MenuTrigger>
            <MenuPopup align="end">
              <MenuItem onClick={() => setEditing(true)}>
                <Pencil />
                Edit
              </MenuItem>
              <MenuItem
                variant="destructive"
                onClick={() => {
                  if (confirm("Delete this comment?")) {
                    router.delete(commentPath(comment.id), {
                      preserveScroll: true,
                    })
                  }
                }}
              >
                <Trash2 />
                Delete
              </MenuItem>
            </MenuPopup>
          </Menu>
        )}
      </div>
      <div
        className="rich-text mt-2 text-sm"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: comment bodies are sanitized server-side (RichDescription.sanitize)
        dangerouslySetInnerHTML={{ __html: comment.body }}
      />
    </div>
  )
}
