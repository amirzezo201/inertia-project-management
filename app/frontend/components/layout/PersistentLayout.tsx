import type { ReactNode } from "react"

import { ToastProvider } from "@/components/ui/toast"
import { FlashToasts } from "./FlashToasts"

interface PersistentLayoutProps {
  children: ReactNode
}

export default function PersistentLayout({ children }: PersistentLayoutProps) {
  return (
    <ToastProvider>
      <FlashToasts />
      <div className="relative isolate flex min-h-svh flex-col">{children}</div>
    </ToastProvider>
  )
}
