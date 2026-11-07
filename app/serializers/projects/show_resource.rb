# frozen_string_literal: true

# The project on its own pages, including the defaults its settings edit.
class Projects::ShowResource < BaseResource
  attributes :id, :name, :identifier, :description, :default_assignee_id, :default_status_id, :created_at
end
