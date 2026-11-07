# frozen_string_literal: true

class MilestoneResource < ApplicationResource
  attributes :id, :project_id, :name, :description, :status, :start_date, :target_date, :color

  attribute :tasks_count do |milestone|
    milestone.tasks.size
  end

  attribute :completed_tasks_count, &:completed_tasks_count
end
