# frozen_string_literal: true

# A record of something that happened, like Huly's activity messages:
# "task_created", "task_updated" (with { attribute, from, to }),
# "task_subtask_added", "comment_created". Events are the activity feed.
class Event < ApplicationRecord
  belongs_to :project
  belongs_to :creator, class_name: "User"
  belongs_to :eventable, polymorphic: true

  scope :chronologically, -> { order(:created_at, :id) }

  def action
    super&.inquiry
  end
end
