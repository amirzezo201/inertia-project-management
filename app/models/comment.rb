# frozen_string_literal: true

# A rich-text comment on a task (or any Commentable), like Huly's ChatMessage
# in a document's activity.
class Comment < ApplicationRecord
  include Eventable

  belongs_to :commentable, polymorphic: true, touch: true
  belongs_to :creator, class_name: "User", default: -> { Current.user }

  normalizes :body, with: ->(html) { RichDescription.sanitize(html) }

  validates :body, presence: true

  after_create -> { track_event :created, creator: creator }

  delegate :project, to: :commentable

  def edit(body)
    self.body = body
    self.edited_at = Time.current if body_changed?
    save
  end
end
