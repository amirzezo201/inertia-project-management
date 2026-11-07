# frozen_string_literal: true

# Attaches files the browser already uploaded to storage (Active Storage direct
# uploads) to a task, by their signed ids, and removes them.
class Tasks::AttachmentsController < InertiaController
  before_action :set_task

  def create
    if @task.attach_files(params.expect(signed_ids: []))
      redirect_to task_path(@task)
    else
      redirect_to task_path(@task), inertia: { errors: @task.errors }
    end
  end

  def destroy
    @task.remove_attachment(@task.attachments.find(params[:id]))

    redirect_to task_path(@task)
  end

  private
    def set_task
      @task = Task.find(params[:task_id])
    end
end
