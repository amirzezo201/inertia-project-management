# frozen_string_literal: true

module ProjectScoped
  extend ActiveSupport::Concern

  # Huly-style view modes for task lists.
  TASK_MODES = %w[ all active backlog ].freeze

  private
    def set_project
      @project = Project.find(params[:project_id])
    end

    # Lookup data every project page needs to render task fields.
    def project_props(project)
      {
        project: ProjectResource.new(project).to_h,
        statuses: StatusResource.new(project.statuses).to_h,
        milestones: MilestoneResource.new(project.milestones.order(:target_date)).to_h,
        users: UserSummaryResource.new(User.order(:name)).to_h
      }
    end

    # Lookup data for task lists that span projects.
    def cross_project_props
      {
        statuses: StatusResource.new(Status.order(:position)).to_h,
        milestones: MilestoneResource.new(Milestone.order(:target_date)).to_h,
        users: UserSummaryResource.new(User.order(:name)).to_h
      }
    end

    def task_mode
      TASK_MODES.include?(params[:mode]) ? params[:mode] : "all"
    end

    def filter_by_task_mode(tasks)
      case task_mode
      when "active" then tasks.active
      when "backlog" then tasks.backlog
      else tasks
      end
    end
end
