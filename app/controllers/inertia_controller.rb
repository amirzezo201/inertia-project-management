# frozen_string_literal: true

class InertiaController < ApplicationController
  inertia_config default_render: true
  inertia_share sidebar_projects: -> { ProjectResource.new(Project.order(:name)).to_h if Current.user }
  inertia_share auth: {
        user: -> { UserResource.new(Current.user).to_h if Current.user },
        session: -> { { id: Current.session.id } if Current.session }
      }

  # Options for the global "New task" dialog (any project). Optional props are
  # only sent when the dialog asks for them with a partial reload.
  inertia_share task_form: InertiaRails.optional {
    {
      statuses: StatusResource.new(Status.order(:project_id, :position)).to_h,
      milestones: MilestoneResource.new(Milestone.order(:target_date)).to_h,
      users: UserSummaryResource.new(User.order(:name)).to_h
    }
  }
end
