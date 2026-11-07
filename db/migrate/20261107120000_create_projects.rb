# frozen_string_literal: true

class CreateProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :projects do |t|
      t.string :name, null: false
      t.string :identifier, null: false
      t.text :description
      t.integer :last_task_number, null: false, default: 0
      t.references :creator, null: false
      t.references :default_assignee
      t.references :default_status

      t.timestamps

      t.index :identifier, unique: true
    end
  end
end
