# frozen_string_literal: true

# Huly's "My issues": tasks assigned to or created by the current user.
class MyTasksController < InertiaController
  include ProjectScoped

  MODES = %w[ assigned created ].freeze

  def show
    render inertia: cross_project_props.merge(mode: mode, tasks: TaskResource.new(tasks).to_h)
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
