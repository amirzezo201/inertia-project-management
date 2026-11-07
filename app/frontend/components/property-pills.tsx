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

export type PillVariant = "pill" | "ghost"

function variantClassName(variant: PillVariant) {
  return variant === "ghost" ? ghostClassName : pillClassName
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
}

export function PillSelect({
  label,
  value,
  options,
  onChange,
  icon,
  variant = "pill",
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
        size="sm"
        className={cn(
          variantClassName(variant),
          !value && "text-muted-foreground",
        )}
      >
        {selected?.icon ?? icon}
        <SelectValue />
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
            )}
          />
        }
      >
        <CalendarDays />
        {value
          ? variant === "ghost"
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
