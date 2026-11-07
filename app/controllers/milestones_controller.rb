# frozen_string_literal: true

class MilestonesController < InertiaController
  before_action :set_project, only: %i[ index create ]
  before_action :set_milestone, only: %i[ show update destroy ]

  def index
    milestones = @project.milestones.in_mode(mode).order(:target_date)

    render inertia: {
      milestones: Milestones::IndexResource.serialize(milestones),
      mode: mode,
      project: Projects::ShowResource.serialize(@project),
      statuses: SimpleResources::Status.serialize(@project.statuses),
      users: OptionResource.serialize(User.order(:name))
    }
  end

  def show
    tasks = @milestone.tasks.order(:position, :number)

    render inertia: {
      milestone: Milestones::ShowResource.serialize(@milestone),
      tasks: Tasks::IndexResource.serialize(tasks),
      project: Projects::ShowResource.serialize(@milestone.project),
      statuses: SimpleResources::Status.serialize(@milestone.project.statuses),
      milestones: SimpleResources::Milestone.serialize(@milestone.project.milestones.order(:target_date)),
      users: OptionResource.serialize(User.order(:name))
    }
  end

  def create
    milestone = @project.milestones.new(milestone_params)

    if milestone.save
      redirect_to project_milestones_path(@project), notice: "Milestone created"
    else
      redirect_to project_milestones_path(@project), inertia: { errors: milestone.errors }
    end
  end

  def update
    if @milestone.update(milestone_params)
      redirect_to milestone_path(@milestone)
    else
      redirect_to milestone_path(@milestone), inertia: { errors: @milestone.errors }
    end
  end

  def destroy
    @milestone.destroy!
    redirect_to project_milestones_path(@milestone.project), notice: "Milestone deleted"
  end

  private
    def set_project
      @project = Project.find(params[:project_id])
    end

    def set_milestone
      @milestone = Milestone.find(params[:id])
    end

    def mode
      Milestone::MODES.include?(params[:mode]) ? params[:mode] : "all"
    end

    def milestone_params
      params.permit(:name, :description, :status, :start_date, :target_date)
    end
end
