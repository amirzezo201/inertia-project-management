import type { ReactNode } from "react"

import AuthLayoutTemplate from "@/components/layout/AuthSplitLayout"

export default function AuthLayout({
  children,
  title,
  description,
  footer,
}: {
  children: ReactNode
  title: string
  description: string
  footer?: ReactNode
}) {
  return (
    <AuthLayoutTemplate title={title} description={description} footer={footer}>
      {children}
    </AuthLayoutTemplate>
  )
}
