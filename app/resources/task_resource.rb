# frozen_string_literal: true

class TaskResource < ApplicationResource
  attributes :id, :project_id, :parent_id, :status_id, :milestone_id, :assignee_id, :creator_id,
    :number, :identifier, :title, :description, :priority, :start_date, :due_date,
    :position, :subtasks_count, :created_at, :updated_at

  attribute :estimation do |task|
    task.estimation.to_f
  end
end
