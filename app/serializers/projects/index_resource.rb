# frozen_string_literal: true

class Projects::IndexResource < BaseResource
  attributes :id, :name, :identifier, :description, :default_assignee_id, :default_status_id, :created_at
end
