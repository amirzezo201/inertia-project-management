# frozen_string_literal: true

class EventResource < ApplicationResource
  attributes :id, :action, :creator_id, :particulars, :created_at

  attribute :comment do |event|
    CommentResource.new(event.eventable).to_h if event.eventable_type == "Comment"
  end
end
