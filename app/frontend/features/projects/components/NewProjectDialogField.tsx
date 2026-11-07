import { Info } from "lucide-react"
import type { ReactNode } from "react"

export function NewProjectDialogField({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string | string[]
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1 flex items-center gap-1 font-medium text-muted-foreground text-xs"
      >
        {label}
        {hint && (
          <span title={hint} className="inline-flex">
            <Info className="size-3" aria-label={hint} />
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-destructive-foreground text-xs">
          {[error].flat().join(" ")}
        </p>
      )}
    </div>
  )
}
