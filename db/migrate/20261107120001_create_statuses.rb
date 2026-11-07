# frozen_string_literal: true

class CreateStatuses < ActiveRecord::Migration[8.1]
  def change
    create_table :statuses do |t|
      t.references :project, null: false, index: false
      t.string :name, null: false
      t.string :category, null: false
      t.string :color
      t.integer :position, null: false, default: 0

      t.timestamps

      t.index [ :project_id, :name ], unique: true
    end
  end
end
