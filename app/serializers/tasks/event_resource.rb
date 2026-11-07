# frozen_string_literal: true

# One entry in a task's activity feed.
class Tasks::EventResource < BaseResource
  attributes :id, :action, :creator_id, :particulars, :created_at

  attribute :comment do |event|
    Tasks::CommentResource.serialize(event.eventable) if event.eventable_type == "Comment"
  end
end
