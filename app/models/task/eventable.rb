# frozen_string_literal: true

# Records task history for the activity feed, the way Huly records a
# DocUpdateMessage per changed attribute.
module Task::Eventable
  extend ActiveSupport::Concern

  include ::Eventable

  TRACKED_ATTRIBUTES = %w[
    title description status_id priority assignee_id milestone_id start_date due_date estimation
  ].freeze

  included do
    after_create :track_creation
    after_update :track_changes
  end

  # The task's own events and its comments, oldest first.
  def activity
    Event.where(eventable: self)
      .or(Event.where(eventable_type: "Comment", eventable_id: comments.select(:id)))
      .preload(:eventable)
      .chronologically
  end

  private
    def track_creation
      track_event :created, creator: creator
      parent&.track_event :subtask_added, creator: creator, subtask_id: id, identifier: identifier, title: title
    end

    def track_changes
      TRACKED_ATTRIBUTES.each do |attribute|
        if saved_change_to_attribute?(attribute)
          from, to = saved_change_to_attribute(attribute)
          track_event :updated,
            attribute: attribute.delete_suffix("_id"),
            from: readable_value(attribute, from),
            to: readable_value(attribute, to)
        end
      end
    end

    # Names rather than ids, so history still reads right after renames or deletes.
    def readable_value(attribute, value)
      case attribute
      when "status_id" then Status.find_by(id: value)&.name
      when "assignee_id" then User.find_by(id: value)&.name
      when "milestone_id" then Milestone.find_by(id: value)&.name
      when "description" then nil
      when "estimation" then value&.to_f
      else value
      end
    end
end
