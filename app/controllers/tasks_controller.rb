# frozen_string_literal: true

class TasksController < InertiaController
  include ProjectScoped

  before_action :set_project, only: :create
  before_action :set_task, only: %i[ show update destroy ]

  def index
    tasks = filter_by_task_mode(Task.all).order(:project_id, :number)

    render inertia: cross_project_props.merge(mode: task_mode, tasks: TaskResource.new(tasks).to_h)
  end

  def show
    render inertia: project_props(@task.project).merge(
      task: TaskResource.new(@task).to_h,
      parent: (TaskResource.new(@task.parent).to_h if @task.parent),
      subtasks: TaskResource.new(@task.subtasks.order(:number)).to_h,
      activity: EventResource.new(@task.activity).to_h
    )
  end

  def create
    task = @project.tasks.new(task_params)

    if task.save
      redirect_back_or_to project_path(@project), notice: "Created #{task.identifier}"
    else
      redirect_back_or_to project_path(@project), inertia: { errors: task.errors }
    end
  end

  def update
    if @task.update(task_params)
      redirect_back_or_to task_path(@task)
    else
      redirect_back_or_to task_path(@task), inertia: { errors: @task.errors }
    end
  end

  def destroy
    @task.destroy!
    redirect_to project_path(@task.project), notice: "Deleted #{@task.identifier}"
  end

  private
    def set_task
      @task = Task.find(params[:id])
    end

    def task_params
      params.permit(:title, :description, :status_id, :priority, :assignee_id, :milestone_id,
        :parent_id, :start_date, :due_date, :estimation,
        subtasks_attributes: [ :title, :description, :status_id, :priority, :assignee_id, :milestone_id, :due_date, :estimation ])
    end
end
