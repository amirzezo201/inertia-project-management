# frozen_string_literal: true

# Small shared shapes: lookups, pickers, and nested references.
module SimpleResources
  # The signed-in user, shared with every page.
  class CurrentUser < BaseResource
    attributes :id, :name, :email, :verified, :created_at, :updated_at
  end

  class Project < BaseResource
    attributes :id, :name, :identifier, :default_assignee_id, :default_status_id
  end

  class Status < BaseResource
    attributes :id, :project_id, :name, :category, :color, :position
  end

  class Milestone < BaseResource
    attributes :id, :project_id, :name, :status, :start_date, :target_date, :color
  end
end
