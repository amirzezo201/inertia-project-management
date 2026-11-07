import { useEffect, useState } from "react"

import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Option } from "@/types"

interface FormSelectProps {
  id?: string
  name?: string
  options: Option[]
  defaultValue?: string | null
  placeholder?: string
  onValueChange?: (value: string) => void
}

// A Select that submits its value through a hidden input, so it works inside
// Inertia <Form>, or reports changes via onValueChange for instant saves.
export function FormSelect({
  id,
  name,
  options,
  defaultValue,
  placeholder,
  onValueChange,
}: FormSelectProps) {
  // Controlled internally so the selection follows server updates after a save.
  const [value, setValue] = useState(defaultValue ?? "")
  useEffect(() => setValue(defaultValue ?? ""), [defaultValue])

  return (
    <Select
      name={name}
      items={options}
      value={value}
      onValueChange={(next) => {
        const selected = String(next ?? "")
        setValue(selected)
        onValueChange?.(selected)
      }}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectPopup alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}
