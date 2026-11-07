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

// The task page's Properties pills: sized to their value, with the app's
// usual rounded-lg corners.
const propertyClassName =
  "h-7 min-h-7 w-auto max-w-full min-w-0 justify-start gap-1.5 rounded-lg px-2.5 text-sm font-normal sm:h-7 sm:min-h-7 sm:text-sm [&_[data-slot=select-icon]]:hidden [&_svg]:size-3.5 sm:[&_svg]:size-3.5"

export type PillVariant = "pill" | "ghost" | "chip" | "property"

export function variantClassName(variant: PillVariant) {
  if (variant === "ghost") return ghostClassName
  if (variant === "chip") return chipClassName
  if (variant === "property") return propertyClassName
  return pillClassName
}
