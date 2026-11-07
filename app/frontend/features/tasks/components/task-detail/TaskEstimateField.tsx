import { useState } from "react"

import { EstimatePill } from "@/components/common/fields/EstimatePill"
import type { PillVariant } from "@/components/common/fields/pillVariant"
import type { Task } from "@/types"

// Saves when the estimate popover closes, not on every keystroke.
export function TaskEstimateField({
  task,
  onSave,
  variant = "ghost",
}: {
  task: Task
  onSave: (value: string) => void
  variant?: PillVariant
}) {
  const [value, setValue] = useState(
    task.estimation ? String(task.estimation) : "",
  )

  return (
    <EstimatePill
      variant={variant}
      value={value}
      onChange={setValue}
      onClose={() => {
        if (Number(value) !== task.estimation) onSave(value || "0")
      }}
    />
  )
}
