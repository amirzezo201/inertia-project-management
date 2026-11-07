# frozen_string_literal: true

# Huly's "My issues": tasks assigned to or created by the current user.
class MyTasksController < InertiaController
  MODES = %w[ assigned created ].freeze

  def show
    render inertia: {
      tasks: Tasks::IndexResource.serialize(tasks),
      mode: mode,
      statuses: SimpleResources::Status.serialize(Status.order(:position)),
      milestones: SimpleResources::Milestone.serialize(Milestone.order(:target_date)),
      users: OptionResource.serialize(User.order(:name))
    }
  end

  private
    def mode
      MODES.include?(params[:mode]) ? params[:mode] : "assigned"
    end

    def tasks
      scope = mode == "created" ? Task.where(creator: Current.user) : Task.where(assignee: Current.user)
      scope.order(:project_id, :number)
    end
end
