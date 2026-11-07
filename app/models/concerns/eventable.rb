# frozen_string_literal: true

module Eventable
  extend ActiveSupport::Concern

  included do
    has_many :events, as: :eventable, dependent: :destroy
  end

  # Records "<model>_<action>", e.g. track_event(:created) on a Task records
  # "task_created". Skipped when nobody is acting (console, seeds).
  def track_event(action, creator: Current.user, **particulars)
    if creator
      events.create!(action: "#{eventable_prefix}_#{action}", creator:, project:, particulars:)
    end
  end

  private
    def eventable_prefix
      self.class.name.demodulize.underscore
    end
end
