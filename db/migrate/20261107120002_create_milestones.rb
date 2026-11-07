# frozen_string_literal: true

class CreateMilestones < ActiveRecord::Migration[8.1]
  def change
    create_table :milestones do |t|
      t.references :project, null: false, index: false
      t.string :name, null: false
      t.text :description
      t.string :status, null: false, default: "planned"
      t.date :start_date
      t.date :target_date
      t.string :color

      t.timestamps

      t.index [ :project_id, :status ]
    end
  end
end
