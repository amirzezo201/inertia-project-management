import { router } from "@inertiajs/react"
import { ListFilter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@/components/ui/menu"
import { cn } from "@/lib/utils"
import type { PageMode } from "./PageHeader"

export function PageHeaderModeFilter({
  modes,
  mode,
}: {
  modes: PageMode[]
  mode?: string
}) {
  const current = modes.find((m) => m.value === mode) ?? modes[0]
  const filtered = current.value !== modes[0].value

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              filtered && "border-primary/40 bg-primary/8 text-primary",
            )}
          />
        }
      >
        <ListFilter />
        {filtered ? current.label : "Filters"}
      </MenuTrigger>
      <MenuPopup align="end" className="min-w-40">
        <MenuGroup>
          <MenuGroupLabel>Show</MenuGroupLabel>
          <MenuRadioGroup
            value={current.value}
            onValueChange={(value) => {
              const target = modes.find((m) => m.value === value)
              if (target) router.visit(target.href, { preserveScroll: true })
            }}
          >
            {modes.map((m) => (
              <MenuRadioItem key={m.value} value={m.value}>
                {m.label}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  )
}
