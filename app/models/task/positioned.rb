# frozen_string_literal: true

# A task's place on the board: its status column and its order inside it.
module Task::Positioned
  extend ActiveSupport::Concern

  # Puts the task into +status+'s column just before +before+, or last when
  # +before+ is nil or not in that column, and renumbers the column. A move
  # within the same column changes only the order, so it records no event.
  def move_to(status, before: nil)
    transaction do
      column = project.tasks.where(status: status).where.not(id: id).order(:position, :number).to_a
      column.insert(column.index(before) || column.size, self)

      column.each_with_index do |task, position|
        if task == self
          update!(status: status, position: position)
        elsif task.position != position
          task.update_column(:position, position)
        end
      end
    end
  end
end
