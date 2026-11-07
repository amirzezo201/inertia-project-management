import { Form, Head, Link } from "@inertiajs/react"
import { SlidersHorizontal } from "lucide-react"

import { FormSelect } from "@/components/form-select"
import { PageHeader } from "@/components/page-header"
import { SettingsSection } from "@/components/settings-section"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/layouts/app-layout"
import { optionsFor } from "@/lib/tasks"
import { projectPath } from "@/routes"
import type { ProjectProps } from "@/types"

export default function ProjectEdit({
  project,
  statuses,
  users,
}: ProjectProps) {
  return (
    <AppLayout
      header={
        <PageHeader
          icon={<SlidersHorizontal />}
          title={
            <>
              {project.name}{" "}
              <span className="font-normal text-muted-foreground">
                · Settings
              </span>
            </>
          }
        />
      }
    >
      <Head title={`${project.name} settings`} />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex max-w-2xl flex-col gap-6">
          <Form
            action={projectPath(project.id)}
            method="patch"
            options={{ preserveScroll: true }}
          >
            {({ errors, processing, recentlySuccessful }) => (
              <SettingsSection
                title="Project settings"
                description={`Tasks in this project are numbered ${project.identifier}-1, ${project.identifier}-2, …`}
                footer={
                  <>
                    <Button type="submit" loading={processing}>
                      Save
                    </Button>
                    {recentlySuccessful && (
                      <p className="fade-in animate-in text-muted-foreground text-sm">
                        Saved
                      </p>
                    )}
                  </>
                }
              >
                <div className="grid gap-4">
                  <Field invalid={!!errors.name}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={project.name}
                      required
                    />
                    <FieldError match={!!errors.name}>
                      {errors.name?.join(" ")}
                    </FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      name="description"
                      rows={3}
                      defaultValue={project.description ?? ""}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="default_status_id">
                        Default status
                      </FieldLabel>
                      <FormSelect
                        id="default_status_id"
                        name="default_status_id"
                        options={optionsFor(statuses)}
                        defaultValue={String(project.default_status_id ?? "")}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="default_assignee_id">
                        Default assignee
                      </FieldLabel>
                      <FormSelect
                        id="default_assignee_id"
                        name="default_assignee_id"
                        options={optionsFor(users, "Unassigned")}
                        defaultValue={String(project.default_assignee_id ?? "")}
                      />
                    </Field>
                  </div>
                </div>
              </SettingsSection>
            )}
          </Form>

          <SettingsSection
            title="Delete project"
            description="Deletes the project with all of its tasks and milestones."
            footer={
              <Button
                variant="destructive"
                render={
                  <Link
                    href={projectPath(project.id)}
                    method="delete"
                    as="button"
                    onBefore={() =>
                      confirm(`Delete ${project.name} and all of its tasks?`)
                    }
                  />
                }
              >
                Delete project
              </Button>
            }
          >
            <p className="text-destructive-foreground text-sm">
              This cannot be undone.
            </p>
          </SettingsSection>
        </div>
      </div>
    </AppLayout>
  )
}
