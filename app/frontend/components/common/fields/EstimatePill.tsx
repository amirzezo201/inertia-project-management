import { Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { type PillVariant, variantClassName } from "./pillVariant"

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
