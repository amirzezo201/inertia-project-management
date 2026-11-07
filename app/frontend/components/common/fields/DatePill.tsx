import { CalendarDays, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/tasks"

import { toDate, toValue } from "./dateValue"
import { type PillVariant, variantClassName } from "./pillVariant"

interface DatePillProps {
  label: string
  value: string
  onChange: (value: string) => void
  variant?: PillVariant
  // Extra classes, e.g. a warning colour for an overdue due date.
  className?: string
}

export function DatePill({
  label,
  value,
  onChange,
  variant = "pill",
  className,
}: DatePillProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={label}
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              variantClassName(variant),
              !value && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarDays />
        {value
          ? variant !== "pill"
            ? formatDate(value)
            : `${label}: ${formatDate(value)}`
          : variant === "ghost"
            ? "Not set"
            : label}
      </PopoverTrigger>
      <PopoverPopup align="start" className="w-auto">
        <Calendar
          mode="single"
          selected={value ? toDate(value) : undefined}
          defaultMonth={value ? toDate(value) : undefined}
          onSelect={(date: Date | undefined) => {
            onChange(date ? toValue(date) : "")
            setOpen(false)
          }}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => {
              onChange("")
              setOpen(false)
            }}
          >
            <X />
            Clear {label.toLowerCase()}
          </Button>
        )}
      </PopoverPopup>
    </Popover>
  )
}
