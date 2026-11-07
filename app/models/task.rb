# frozen_string_literal: true

class Task < ApplicationRecord
  include RichDescription, Eventable, Commentable, Positioned

  belongs_to :project, touch: true
  belongs_to :parent, class_name: "Task", optional: true, counter_cache: :subtasks_count, touch: true
  belongs_to :status
  belongs_to :milestone, optional: true
  belongs_to :assignee, class_name: "User", optional: true
  belongs_to :creator, class_name: "User", default: -> { Current.user }

  has_many :subtasks, class_name: "Task", foreign_key: :parent_id, inverse_of: :parent, dependent: :destroy

  accepts_nested_attributes_for :subtasks, reject_if: ->(attributes) { attributes[:title].blank? }

  enum :priority, { no_priority: 0, urgent: 1, high: 2, medium: 3, low: 4 }

  scope :in_categories, ->(*categories) { joins(:status).where(statuses: { category: categories }) }
  scope :active, -> { in_categories("unstarted", "started") }
  scope :backlog, -> { in_categories("backlog") }
  # Backlog, Todo, In progress, Done, Canceled: the order lists group them in,
  # so a paged list only ever adds rows to its last group.
  scope :in_category_order, -> do
    joins(:status).in_order_of(:"statuses.category", Status::CATEGORIES, filter: false).order(:project_id, :number)
  end

  normalizes :estimation, with: -> { it.presence || 0 }, apply_to_nil: true

  validates :title, presence: true
  validate :belongs_to_same_project, :parent_not_a_subtask

  before_validation :apply_project_defaults, on: :create
  before_create :assign_number

  delegate :closed?, to: :status

  def identifier
    "#{project.identifier}-#{number}"
  end

  private
    def apply_project_defaults
      self.project ||= parent&.project

      if project
        self.status ||= project.default_status
        self.assignee ||= project.default_assignee
      end
    end

    def belongs_to_same_project
      { status: status, milestone: milestone, parent: parent }.each do |attribute, record|
        if record && record.project_id != project_id
          errors.add(attribute, :invalid, message: "must belong to the same project")
        end
      end
    end

    def parent_not_a_subtask
      ancestor = parent

      while ancestor
        if ancestor == self
          errors.add(:parent, :invalid, message: "can't be the task itself or one of its subtasks")
          break
        end

        ancestor = ancestor.parent
      end
    end

    def assign_number
      self.number = project.next_task_number
    end
end
