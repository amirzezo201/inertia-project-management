import { CalendarDays, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/tasks"

import { toDate, toValue } from "./dateValue"
import { type PillVariant, variantClassName } from "./pillVariant"

interface DateRangePillProps {
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
  variant?: PillVariant
}

// Plane's "Start date - End date" chip on cycles: one picker for a range.
export function DateRangePill({
  from,
  to,
  onChange,
  variant = "chip",
}: DateRangePillProps) {
  const label =
    from || to
      ? `${from ? formatDate(from) : "Start date"} – ${to ? formatDate(to) : "End date"}`
      : "Start date - End date"

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Dates"
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              variantClassName(variant),
              !from && !to && "text-muted-foreground",
            )}
          />
        }
      >
        <CalendarDays />
        {label}
      </PopoverTrigger>
      <PopoverPopup align="start" className="w-auto">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={{
            from: from ? toDate(from) : undefined,
            to: to ? toDate(to) : undefined,
          }}
          defaultMonth={from ? toDate(from) : undefined}
          onSelect={(range: { from?: Date; to?: Date } | undefined) =>
            onChange({
              from: range?.from ? toValue(range.from) : "",
              to: range?.to ? toValue(range.to) : "",
            })
          }
        />
        {(from || to) && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => onChange({ from: "", to: "" })}
          >
            <X />
            Clear dates
          </Button>
        )}
      </PopoverPopup>
    </Popover>
  )
}
