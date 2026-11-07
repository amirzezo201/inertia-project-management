# frozen_string_literal: true

# A milestone row with its progress.
class Milestones::IndexResource < BaseResource
  attributes :id, :project_id, :name, :status, :start_date, :target_date, :color

  attribute :tasks_count do |milestone|
    milestone.tasks.size
  end

  attribute :completed_tasks_count, &:completed_tasks_count
end
