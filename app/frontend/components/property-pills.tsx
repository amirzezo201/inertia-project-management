import { CalendarDays, Clock, X } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/tasks"
import { cn } from "@/lib/utils"

// Compact property buttons for the bottom row of create dialogs, like Huly's
// "pool" of Status / Priority / Assignee / Milestone / Due date buttons.

const pillClassName =
  "h-8 min-h-8 w-auto min-w-0 gap-1.5 rounded-lg px-2.5 text-sm sm:h-7 sm:min-h-7 [&_svg]:size-4 sm:[&_svg]:size-3.5"

// Borderless, full-width values for a detail page's side panel (Huly's aside).
const ghostClassName =
  "h-8 min-h-8 w-full min-w-0 justify-start gap-2 rounded-md border-transparent bg-transparent px-2 text-sm shadow-none before:hidden hover:bg-accent dark:bg-transparent sm:h-8 sm:min-h-8 [&_[data-slot=select-icon]]:hidden [&_svg]:size-4"

// Plane's small bordered property chips on list rows (24px tall).
const chipClassName =
  "h-6 min-h-6 w-auto min-w-0 gap-1 rounded-md px-1.5 text-xs font-normal sm:h-6 sm:min-h-6 sm:text-xs [&_[data-slot=select-icon]]:hidden [&_svg]:size-3.5 sm:[&_svg]:size-3.5"

export type PillVariant = "pill" | "ghost" | "chip"

function variantClassName(variant: PillVariant) {
  if (variant === "ghost") return ghostClassName
  if (variant === "chip") return chipClassName
  return pillClassName
}

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
      <SelectPopup>
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

interface DatePillProps {
  label: string
  value: string
  onChange: (value: string) => void
  variant?: PillVariant
  // Extra classes, e.g. a warning colour for an overdue due date.
  className?: string
}

function toDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
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

interface EstimatePillProps {
  value: string
  onChange: (value: string) => void
  onClose?: () => void
  variant?: PillVariant
}

export function EstimatePill({
  value,
  onChange,
  onClose,
  variant = "pill",
}: EstimatePillProps) {
  return (
    <Popover onOpenChange={(open) => !open && onClose?.()}>
      <PopoverTrigger
        aria-label="Estimation"
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              variantClassName(variant),
              !Number(value) && "text-muted-foreground",
            )}
          />
        }
      >
        <Clock />
        {Number(value)
          ? `${Number(value)}h`
          : variant === "ghost"
            ? "Not set"
            : "Estimation"}
      </PopoverTrigger>
      <PopoverPopup align="start" className="w-48">
        <label
          htmlFor="estimation-hours"
          className="mb-1.5 block font-medium text-sm"
        >
          Estimation (hours)
        </label>
        <Input
          id="estimation-hours"
          type="number"
          min={0}
          step={0.25}
          value={value}
          autoFocus
          onChange={(event) => onChange(event.target.value)}
        />
      </PopoverPopup>
    </Popover>
  )
}

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
