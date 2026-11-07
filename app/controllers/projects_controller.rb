# frozen_string_literal: true

class ProjectsController < InertiaController
  before_action :set_project, only: %i[ show edit update destroy ]

  # Huly-style view modes for task lists.
  MODES = %w[ all active backlog ].freeze

  def index
    render inertia: {
      projects: Projects::IndexResource.serialize(Project.order(:name)),
      users: OptionResource.serialize(User.order(:name)),
      default_statuses: Project::DEFAULT_STATUSES
    }
  end

  def show
    tasks = filter_by_mode(@project.tasks).order(:position, :number)

    render inertia: {
      tasks: Tasks::IndexResource.serialize(tasks),
      mode: mode,
      project: Projects::ShowResource.serialize(@project),
      statuses: SimpleResources::Status.serialize(@project.statuses),
      milestones: SimpleResources::Milestone.serialize(@project.milestones.order(:target_date)),
      users: OptionResource.serialize(User.order(:name))
    }
  end

  def create
    project = Project.new(project_params.merge(params.permit(:identifier, :default_status_name)))

    if project.save
      redirect_to project_path(project), notice: "Project created"
    else
      redirect_to projects_path, inertia: { errors: project.errors }
    end
  end

  def edit
    render inertia: {
      project: Projects::ShowResource.serialize(@project),
      statuses: SimpleResources::Status.serialize(@project.statuses),
      milestones: SimpleResources::Milestone.serialize(@project.milestones.order(:target_date)),
      users: OptionResource.serialize(User.order(:name))
    }
  end

  def update
    if @project.update(project_params)
      redirect_to edit_project_path(@project), notice: "Project updated"
    else
      redirect_to edit_project_path(@project), inertia: { errors: @project.errors }
    end
  end

  def destroy
    @project.destroy!
    redirect_to projects_path, notice: "Project deleted"
  end

  private
    def set_project
      @project = Project.find(params[:id])
    end

    def filter_by_mode(tasks)
      case mode
      when "active" then tasks.active
      when "backlog" then tasks.backlog
      else tasks
      end
    end

    def mode
      MODES.include?(params[:mode]) ? params[:mode] : "all"
    end

    def project_params
      params.permit(:name, :description, :default_assignee_id, :default_status_id)
    end
end
