# frozen_string_literal: true

class Project < ApplicationRecord
  DEFAULT_STATUSES = [
    { name: "Backlog", category: "backlog" },
    { name: "Todo", category: "unstarted" },
    { name: "In Progress", category: "started" },
    { name: "Done", category: "completed" },
    { name: "Canceled", category: "canceled" }
  ].freeze

  # Picked from DEFAULT_STATUSES in the create dialog, before the statuses exist.
  attribute :default_status_name, :string

  belongs_to :creator, class_name: "User", default: -> { Current.user }
  belongs_to :default_assignee, class_name: "User", optional: true
  belongs_to :default_status, class_name: "Status", optional: true

  # Tasks are declared first so they're destroyed before the statuses they reference.
  has_many :tasks, dependent: :destroy
  has_many :milestones, dependent: :destroy
  has_many :statuses, -> { order(:position) }, dependent: :destroy

  normalizes :identifier, with: -> { it.strip.upcase }

  validates :name, presence: true
  validates :identifier, presence: true, uniqueness: true, format: { with: /\A[A-Z][A-Z0-9_]{0,9}\z/ }

  after_create :create_default_statuses

  def next_task_number
    with_lock do
      increment!(:last_task_number)
      last_task_number
    end
  end

  private
    def create_default_statuses
      DEFAULT_STATUSES.each_with_index do |attributes, position|
        statuses.create!(attributes.merge(position: position))
      end

      update!(default_status: statuses.find_by(name: default_status_name) || statuses.backlog.first)
    end
end
