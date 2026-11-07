# frozen_string_literal: true

# The task page: a row plus the description and who/when details.
class Tasks::ShowResource < Tasks::IndexResource
  attributes :parent_id, :description, :creator_id, :created_at, :updated_at
end
