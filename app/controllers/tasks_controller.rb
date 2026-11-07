# frozen_string_literal: true

class TasksController < InertiaController
  before_action :set_project, only: :create
  before_action :set_task, only: %i[ show update destroy ]

  def show
    render inertia: {
      task: Tasks::ShowResource.serialize(@task),
      parent: (Tasks::IndexResource.serialize(@task.parent) if @task.parent),
      subtasks: Tasks::IndexResource.serialize(@task.subtasks.order(:number)),
      activity: Tasks::EventResource.serialize(@task.activity),
      attachments: Tasks::AttachmentResource.serialize(@task.attachments_attachments.includes(:blob).order(:created_at)),
      attachment_max_bytes: Task::MAX_ATTACHMENT_SIZE,
      project: Projects::ShowResource.serialize(@task.project),
      statuses: SimpleResources::Status.serialize(@task.project.statuses),
      milestones: SimpleResources::Milestone.serialize(@task.project.milestones.order(:target_date)),
      users: OptionResource.serialize(User.order(:name))
    }
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
    def set_project
      @project = Project.find(params[:project_id])
    end

    def set_task
      @task = Task.find(params[:id])
    end

    def task_params
      params.permit(:title, :description, :status_id, :priority, :assignee_id, :milestone_id,
        :parent_id, :start_date, :due_date, :estimation,
        subtasks_attributes: [ :title, :description, :status_id, :priority, :assignee_id, :milestone_id, :due_date, :estimation ])
    end
end
