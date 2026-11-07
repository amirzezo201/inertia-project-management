# frozen_string_literal: true

class Tasks::CommentsController < InertiaController
  before_action :set_task, only: :create
  before_action :set_own_comment, only: %i[ update destroy ]

  def create
    comment = @task.comments.new(body: params[:body])

    if comment.save
      redirect_to task_path(@task)
    else
      redirect_to task_path(@task), inertia: { errors: comment.errors }
    end
  end

  def update
    if @comment.edit(params[:body])
      redirect_to @comment.commentable
    else
      redirect_to @comment.commentable, inertia: { errors: @comment.errors }
    end
  end

  def destroy
    @comment.destroy!
    redirect_to @comment.commentable
  end

  private
    def set_task
      @task = Task.find(params[:task_id])
    end

    # Only the author may change a comment; others get a 404.
    def set_own_comment
      @comment = Current.user.comments.find(params[:id])
    end
end
