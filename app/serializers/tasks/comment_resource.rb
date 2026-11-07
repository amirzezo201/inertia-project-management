# frozen_string_literal: true

class Tasks::CommentResource < BaseResource
  attributes :id, :body, :creator_id, :edited_at, :created_at
end
