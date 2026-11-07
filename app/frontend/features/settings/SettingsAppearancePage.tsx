import { Head } from "@inertiajs/react"
import { SettingsSection } from "@/components/common/page/SettingsSection"
import AppLayout from "@/components/layout/AppLayout"
import AppearanceTabs from "@/features/settings/components/SettingsAppearanceTabs"
import SettingsLayout from "@/features/settings/components/SettingsLayout"
import { settingsAppearancePath } from "@/routes"
import type { BreadcrumbItem } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Appearance settings",
    href: settingsAppearancePath(),
  },
]

export default function Appearance() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[breadcrumbs.length - 1].title} />

      <SettingsLayout>
        <SettingsSection
          title="Appearance settings"
          description="Update your account's appearance settings"
        >
          <AppearanceTabs />
        </SettingsSection>
      </SettingsLayout>
    </AppLayout>
  )
}
