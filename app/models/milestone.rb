# frozen_string_literal: true

class Milestone < ApplicationRecord
  include RichDescription

  STATUSES = %w[ planned in_progress completed canceled ].freeze

  # View modes for the milestones list.
  MODES = %w[ all planned active closed ].freeze

  belongs_to :project, touch: true

  has_many :tasks, dependent: :nullify

  enum :status, STATUSES.index_by(&:itself), default: "planned"

  scope :closed, -> { where(status: %w[ completed canceled ]) }
  scope :in_mode, ->(mode) do
    case mode
    when "planned" then planned
    when "active" then in_progress
    when "closed" then closed
    else all
    end
  end

  validates :name, presence: true
  validate :target_date_not_before_start_date

  def completed_tasks_count
    tasks.joins(:status).merge(Status.completed).count
  end

  private
    def target_date_not_before_start_date
      if start_date && target_date && target_date < start_date
        errors.add(:target_date, "can't be before the start date")
      end
    end
end
