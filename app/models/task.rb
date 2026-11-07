# frozen_string_literal: true

class Task < ApplicationRecord
  include RichDescription, Eventable, Commentable, Positioned, Attachable

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

  normalizes :estimation, with: -> { it.presence || 0 }, apply_to_nil: true

  validates :title, presence: true
  validate :belongs_to_same_project, :parent_not_a_subtask
  # Sub-tasks are one level deep: a task is either a parent or a sub-task. Checked
  # only when the parent changes, so sub-tasks nested before the rule stay editable.
  validate :one_level_of_subtasks, if: :parent_id_changed?

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

    def one_level_of_subtasks
      if parent&.parent_id
        errors.add(:parent, :invalid, message: "is itself a sub-task, and sub-tasks can't have sub-tasks")
      elsif parent && subtasks.exists?
        errors.add(:parent, :invalid, message: "can't be set on a task that has sub-tasks")
      end
    end

    def assign_number
      self.number = project.next_task_number
    end
end
