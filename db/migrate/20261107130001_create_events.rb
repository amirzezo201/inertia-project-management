# frozen_string_literal: true

class CreateEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :events do |t|
      t.references :project, null: false
      t.references :creator, null: false
      t.references :eventable, polymorphic: true, null: false
      t.string :action, null: false
      t.json :particulars, null: false, default: {}

      t.timestamps
    end
  end
end
