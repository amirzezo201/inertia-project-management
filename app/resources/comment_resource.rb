# frozen_string_literal: true

class CommentResource < ApplicationResource
  attributes :id, :body, :creator_id, :edited_at, :created_at
end
