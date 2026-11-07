# frozen_string_literal: true

class Tasks::PositionsController < InertiaController
  before_action :set_task

  def update
    @task.move_to(status, before: @task.project.tasks.find_by(id: params[:before_id]))

    redirect_back_or_to project_path(@task.project)
  end

  private
    def set_task
      @task = Task.find(params[:task_id])
    end

    def status
      @task.project.statuses.find(params[:status_id])
    end
end
