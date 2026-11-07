# frozen_string_literal: true

# A task row in a list or a card on the board.
class Tasks::IndexResource < BaseResource
  attributes :id, :project_id, :status_id, :milestone_id, :assignee_id,
    :number, :identifier, :title, :priority, :start_date, :due_date, :subtasks_count

  attribute :estimation do |task|
    task.estimation.to_f
  end
end
