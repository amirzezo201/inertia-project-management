# frozen_string_literal: true

class Status < ApplicationRecord
  CATEGORIES = %w[ backlog unstarted started completed canceled ].freeze

  belongs_to :project, touch: true

  has_many :tasks, dependent: :restrict_with_error

  enum :category, CATEGORIES.index_by(&:itself)

  validates :name, presence: true, uniqueness: { scope: :project_id }

  def closed?
    completed? || canceled?
  end
end
