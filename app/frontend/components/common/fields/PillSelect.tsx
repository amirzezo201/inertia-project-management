import type { ReactNode } from "react"

import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { type PillVariant, variantClassName } from "./pillVariant"

export interface PillOption {
  value: string
  label: string
  icon?: ReactNode
}

interface PillSelectProps {
  label: string
  value: string
  options: PillOption[]
  onChange: (value: string) => void
  icon?: ReactNode
  variant?: PillVariant
  // Show only the icon (e.g. priority on a list row); the label becomes a tooltip.
  iconOnly?: boolean
}

export function PillSelect({
  label,
  value,
  options,
  onChange,
  icon,
  variant = "pill",
  iconOnly = false,
}: PillSelectProps) {
  const selected = options.find((option) => option.value === value)

  return (
    <Select
      items={options}
      value={value}
      onValueChange={(next) => onChange(String(next ?? ""))}
    >
      <SelectTrigger
        aria-label={label}
        title={iconOnly ? `${label}: ${selected?.label ?? "None"}` : undefined}
        size="sm"
        className={cn(
          variantClassName(variant),
          !value && "text-muted-foreground",
        )}
      >
        {selected?.icon ?? icon}
        {iconOnly ? <SelectValue className="sr-only" /> : <SelectValue />}
      </SelectTrigger>
      <SelectPopup alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}
