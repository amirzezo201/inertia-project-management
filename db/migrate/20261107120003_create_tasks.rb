# frozen_string_literal: true

class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.references :project, null: false, index: false
      t.references :parent
      t.references :status, null: false
      t.references :milestone
      t.references :assignee
      t.references :creator, null: false
      t.integer :number, null: false
      t.string :title, null: false
      t.text :description
      t.integer :priority, null: false, default: 0
      t.date :start_date
      t.date :due_date
      t.decimal :estimation, precision: 8, scale: 2, null: false, default: 0
      t.integer :position, null: false, default: 0
      t.integer :subtasks_count, null: false, default: 0

      t.timestamps

      t.index [ :project_id, :number ], unique: true
      t.index [ :project_id, :status_id, :position ]
    end
  end
end
