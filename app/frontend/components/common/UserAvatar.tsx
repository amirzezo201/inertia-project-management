import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useInitials } from "@/hooks/useInitials"
import { cn } from "@/lib/utils"

export function UserAvatar({
  name,
  className,
}: {
  name?: string
  className?: string
}) {
  const getInitials = useInitials()

  return (
    <Avatar className={cn("size-7 shrink-0", className)}>
      <AvatarFallback className="text-[0.625rem]">
        {getInitials(name ?? "?")}
      </AvatarFallback>
    </Avatar>
  )
}
