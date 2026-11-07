# frozen_string_literal: true

class InertiaController < ApplicationController
  inertia_config default_render: true
  inertia_share sidebar_projects: -> { SimpleResources::Project.serialize(Project.order(:name)) if Current.user }
  inertia_share auth: {
        user: -> { SimpleResources::CurrentUser.serialize(Current.user) if Current.user },
        session: -> { { id: Current.session.id } if Current.session }
      }

  # Options for the global "New task" dialog (any project). Optional props are
  # only sent when the dialog asks for them with a partial reload.
  inertia_share task_form: InertiaRails.optional {
    {
      statuses: SimpleResources::Status.serialize(Status.order(:project_id, :position)),
      milestones: SimpleResources::Milestone.serialize(Milestone.order(:target_date)),
      users: OptionResource.serialize(User.order(:name))
    }
  }
end
