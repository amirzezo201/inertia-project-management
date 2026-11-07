import { router } from "@inertiajs/react"
import { Columns3, List } from "lucide-react"

import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"

export type TaskLayout = "list" | "board"

// Plane's icon-only layout switcher in the page header (List / Board).
export function LayoutSwitcher({
  value,
  hrefFor,
}: {
  value: TaskLayout
  hrefFor: (layout: TaskLayout) => string
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) =>
        router.visit(hrefFor(next as TaskLayout), { preserveScroll: true })
      }
    >
      <TabsList size="sm" aria-label="Layout">
        <TabsTab value="list" aria-label="List" title="List">
          <List />
        </TabsTab>
        <TabsTab value="board" aria-label="Board" title="Board">
          <Columns3 />
        </TabsTab>
      </TabsList>
    </Tabs>
  )
}
