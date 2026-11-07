# frozen_string_literal: true

class MilestonesController < InertiaController
  include ProjectScoped

  before_action :set_project, only: %i[ index create ]
  before_action :set_milestone, only: %i[ show update destroy ]

  MODES = %w[ all planned active closed ].freeze

  def index
    milestones = filter_by_mode(@project.milestones).order(:target_date)

    render inertia: project_props(@project).merge(mode: mode, milestones: MilestoneResource.new(milestones).to_h)
  end

  def show
    tasks = @milestone.tasks.order(:position, :number)

    render inertia: project_props(@milestone.project).merge(
      milestone: MilestoneResource.new(@milestone).to_h,
      tasks: TaskResource.new(tasks).to_h
    )
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
    def set_milestone
      @milestone = Milestone.find(params[:id])
    end

    def mode
      MODES.include?(params[:mode]) ? params[:mode] : "all"
    end

    def filter_by_mode(milestones)
      case mode
      when "planned" then milestones.planned
      when "active" then milestones.in_progress
      when "closed" then milestones.closed
      else milestones
      end
    end

    def milestone_params
      params.permit(:name, :description, :status, :start_date, :target_date)
    end
end
