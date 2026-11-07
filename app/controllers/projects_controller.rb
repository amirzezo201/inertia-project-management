# frozen_string_literal: true

class ProjectsController < InertiaController
  include ProjectScoped

  before_action :set_project, only: %i[ show edit update destroy ]

  def index
    render inertia: {
      projects: ProjectResource.new(Project.order(:name)).to_h,
      users: UserSummaryResource.new(User.order(:name)).to_h,
      default_statuses: Project::DEFAULT_STATUSES
    }
  end

  def show
    tasks = filter_by_task_mode(@project.tasks).order(:position, :number)

    render inertia: project_props(@project).merge(mode: task_mode, tasks: TaskResource.new(tasks).to_h)
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
    render inertia: project_props(@project)
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

    def project_params
      params.permit(:name, :description, :default_assignee_id, :default_status_id)
    end
end
